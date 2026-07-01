import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSolicitudes } from './modal-solicitudes';

describe('ModalSolicitudes', () => {
  let component: ModalSolicitudes;
  let fixture: ComponentFixture<ModalSolicitudes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalSolicitudes],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalSolicitudes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
