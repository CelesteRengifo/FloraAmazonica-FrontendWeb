import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargaCatalogo } from './carga-catalogo';

describe('CargaCatalogo', () => {
  let component: CargaCatalogo;
  let fixture: ComponentFixture<CargaCatalogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargaCatalogo],
    }).compileComponents();

    fixture = TestBed.createComponent(CargaCatalogo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
