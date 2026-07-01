import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamiliasEspecies } from './familias-especies';

describe('FamiliasEspecies', () => {
  let component: FamiliasEspecies;
  let fixture: ComponentFixture<FamiliasEspecies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamiliasEspecies],
    }).compileComponents();

    fixture = TestBed.createComponent(FamiliasEspecies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
