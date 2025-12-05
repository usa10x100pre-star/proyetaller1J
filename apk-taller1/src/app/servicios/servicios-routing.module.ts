import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiciosPage } from './servicios.page';

const routes: Routes = [
  {
    path: '',
    component: ServiciosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServiciosPageRoutingModule {}
