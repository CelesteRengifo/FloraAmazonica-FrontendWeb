import {
  Component, Input, ElementRef, ViewChild,
  AfterViewInit, OnChanges, OnDestroy
} from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa-registro',
  standalone: true,
  templateUrl: './mapa-registro.html',
  styleUrl: './mapa-registro.css'
})
export class MapaRegistro implements AfterViewInit, OnChanges, OnDestroy {
  @Input() latitud: number | null = null;
  @Input() longitud: number | null = null;
  @Input() etiqueta?: string;

  @ViewChild('mapa') mapaRef!: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private marcador?: L.Marker;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit() {
    this.inicializarMapa();
  }

  ngOnChanges() {
    if (this.map) this.actualizarUbicacion();
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }

  private inicializarMapa() {
    if (!this.mapaRef || this.latitud === null || this.longitud === null) return;
    const coords: L.LatLngExpression = [this.latitud, this.longitud];

    this.map = L.map(this.mapaRef.nativeElement, {
      center: coords,
      zoom: 13,
      scrollWheelZoom: false,
      attributionControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    this.marcador = L.marker(coords, { icon: this.crearIcono() }).addTo(this.map);

    if (this.etiqueta) {
      this.marcador.bindPopup(this.etiqueta);
    }

    // ResizeObserver: recalcula el mapa apenas el contenedor tiene tamaño real.
    // Soluciona el desfase de tiles cuando el mapa vive dentro de un @if.
    this.resizeObserver = new ResizeObserver(() => {
      this.map?.invalidateSize();
    });
    this.resizeObserver.observe(this.mapaRef.nativeElement);
  }

  private actualizarUbicacion() {
    if (this.latitud === null || this.longitud === null) return;
    const coords: L.LatLngExpression = [this.latitud, this.longitud];
    this.map!.setView(coords, this.map!.getZoom());
    this.marcador?.setLatLng(coords);
    this.map?.invalidateSize();
  }

  private crearIcono(): L.DivIcon {
    return L.divIcon({
      className: 'marcador-flora',
      html: `
        <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34"
             viewBox="0 0 24 24" fill="#2d6a45" stroke="#ffffff"
             stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 21s-6-5.686-6-10a6 6 0 0 1 12 0c0 4.314-6 10-6 10z"/>
          <circle cx="12" cy="11" r="2.5" fill="#ffffff" stroke="none"/>
        </svg>`,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -32]
    });
  }
}