import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { AddEmployeePage } from '../add-employee/add-employee';
import { Subscription } from 'rxjs/Subscription';
import { DatabaseServiceProvider } from '../../providers/database-service/database-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  employees = [];
  subscription: Subscription;

  constructor(public navCtrl: NavController, private databaseService: DatabaseServiceProvider, private alertCtrl: AlertController, private loadingCtrl: LoadingController) { }

  ionViewWillEnter() {

    this.subscription = this.databaseService.fetchData.subscribe(() => {

      this.fetchEmployees();

    }, (err) => {

      let alert = this.alertCtrl.create({
        title: 'Subscription Error',
        message: JSON.stringify(err)
      });
      alert.present();

    });

    this.fetchEmployees();

  }

  addEmployeeNav() {
    this.navCtrl.push(AddEmployeePage);
  }

  editEmployee(id: number) {

    this.navCtrl.push(AddEmployeePage, {id: id});

  }

  deleteEmployee(id: number) {

    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this employee?',
      buttons: [{
        text: 'Yes',
        handler: () => {
          this.databaseService.deleteEmployee(id).then((data) => {
            
            let alert = this.alertCtrl.create({
              title: 'Employee Deleted',
              message: JSON.stringify(data)
            });
            alert.present();
      
            this.fetchEmployees();
      
          }).catch((err) => {
            let alert = this.alertCtrl.create({
              title: 'Unable to delete the employee',
              message: JSON.stringify(err)
            });
            alert.present();
          });
        }
      },
      {
        text: 'Cancel',
        handler: () => { }
      }]
    });

    alert.present();

  }

  fetchEmployees() {

    if(this.databaseService.database) {

      let loader = this.loadingCtrl.create({
        content: 'Loading Employees'
      });
      loader.present();

      this.databaseService.fetchEmployees().then((data) => {
        
        this.employees = [];

        if(data.rows.length > 0){

          for(let i = 0; i < data.rows.length; i++) {

            this.employees.push({id: data.rows.item(i).id, name: data.rows.item(i).name, age: data.rows.item(i).age, email: data.rows.item(i).email});

          }

        }

        loader.dismiss();

      }).catch((error) => {

        loader.dismiss();

        let alert = this.alertCtrl.create({
          title: 'Unable to fetch the data',
          message: JSON.stringify(error)
        });
        alert.present();

      });
    }

  }

  ionViewWillUnload() {
    this.subscription.unsubscribe();
  }

}
