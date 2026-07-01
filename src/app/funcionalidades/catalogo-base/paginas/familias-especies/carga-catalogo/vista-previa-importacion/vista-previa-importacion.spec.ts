import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaPreviaImportacion } from './vista-previa-importacion';

describe('VistaPreviaImportacion', () => {
  let component: VistaPreviaImportacion;
  let fixture: ComponentFixture<VistaPreviaImportacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaPreviaImportacion],
    }).compileComponents();

    fixture = TestBed.createComponent(VistaPreviaImportacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
