import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaRegistro } from './mapa-registro';

describe('MapaRegistro', () => {
  let component: MapaRegistro;
  let fixture: ComponentFixture<MapaRegistro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaRegistro],
    }).compileComponents();

    fixture = TestBed.createComponent(MapaRegistro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
