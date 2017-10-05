import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DatabaseServiceProvider } from '../../providers/database-service/database-service';

@Component({
  selector: 'page-add-employee',
  templateUrl: 'add-employee.html',
})
export class AddEmployeePage {

  employeeForm: FormGroup;
  editForm: boolean = false;

  employeeId: number;
  name: string = '';
  age: number = null;
  email: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, private databaseService: DatabaseServiceProvider, private alertCtrl: AlertController, private loadingCtrl: LoadingController){

    this.employeeId = +this.navParams.get('id');

    if(this.employeeId) {
      this.editForm = true;
    }

    this.createForm();
  }

  createForm() {

    if(this.editForm) {

      let loader = this.loadingCtrl.create({
        content: 'Loading Employee Detail'
      });

      loader.present();

      // Set value from the database
      const fetchEmployeeSql = `SELECT * FROM employees WHERE id=${this.employeeId}`;
      this.databaseService.database.executeSql(fetchEmployeeSql, {}).then((data) => {

        loader.dismiss();

        if(data.rows.length > 0){

          this.name = data.rows.item(0).name;
          this.age = data.rows.item(0).age;
          this.email = data.rows.item(0).email;

        }
        else {

          let alert = this.alertCtrl.create({
            title: 'Employee Fetch Row Error',
            message: JSON.stringify(data)
          });
          alert.present();

        }

      }).catch((err) => {

        loader.dismiss();

        let alert = this.alertCtrl.create({
          title: 'Employee could not be fetched',
          message: JSON.stringify(err)
        });
        alert.present();

      });

    }

    this.employeeForm = this.formBuilder.group({
      name: [this.name, Validators.compose([Validators.required, Validators.pattern('[a-zA-Z ]*')])],
      age: [this.age, Validators.compose([Validators.required, Validators.pattern('[0-9]*'), this.validateAge])],
      email: [this.email, Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9_]+?@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$')])]
    });

  }

  /* Custom Validation Function
  =============================================================
  A simple function takes the FormControl instance and returns null if everything is fine. If the test fails, it returns an object with an arbitrarily named property. The property name is what will be used for the .hasError() test.
  */

  validateAge(control: FormControl): any {

    if(+control.value < 110) {
      return null;
    }
    else {
      return {validage: false};
    }

  }

  onSubmit() {
    console.log(this.employeeForm);

    if(this.editForm){

      this.databaseService.updateEmployee(this.employeeId, this.employeeForm.value).then((data) => {
        let alert = this.alertCtrl.create({
          title: 'Updated Successfully',
          message: JSON.stringify(data)
        });
        alert.present();
        this.navCtrl.pop();
      }).catch((err) => {
        let alert = this.alertCtrl.create({
          title: 'Unable to update',
          message: JSON.stringify(err)
        });
        alert.present();
        this.navCtrl.pop();
      });

    }
    else{

      this.databaseService.insertEmployee(this.employeeForm.value).then((data) => {
        let alert = this.alertCtrl.create({
          title: 'Inserted Successfully',
          message: JSON.stringify(data)
        });
        alert.present();
        this.navCtrl.pop();
      }).catch((err) => {
        let alert = this.alertCtrl.create({
          title: 'Unable to insert the data',
          message: JSON.stringify(err)
        });
        alert.present();
      });

    }

  }

}
