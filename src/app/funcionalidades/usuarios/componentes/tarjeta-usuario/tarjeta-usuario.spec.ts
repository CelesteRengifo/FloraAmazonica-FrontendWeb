import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarjetaUsuario } from './tarjeta-usuario';

describe('TarjetaUsuario', () => {
  let component: TarjetaUsuario;
  let fixture: ComponentFixture<TarjetaUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarjetaUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(TarjetaUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
