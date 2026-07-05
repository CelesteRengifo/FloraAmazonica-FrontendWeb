import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSeccion } from './modal-seccion';

describe('ModalSeccion', () => {
  let component: ModalSeccion;
  let fixture: ComponentFixture<ModalSeccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalSeccion],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalSeccion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
