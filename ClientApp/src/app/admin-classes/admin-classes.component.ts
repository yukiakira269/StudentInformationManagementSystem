import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-classes',
  templateUrl: './admin-classes.component.html',
  styleUrls: ['./admin-classes.component.css']
})
export class AdminClassesComponent implements OnInit {
  baseUrl: string;
  client: HttpClient;
  classes: Class[];
  teachers: Teacher[];
  courses: Course[];
  classForm: FormGroup;
  errMsg: string;
  isLoaded: boolean;

  constructor(
    http: HttpClient,
    @Inject('BASE_URL') baseUrl,
    private fb: FormBuilder
  ) {
    this.client = http;
    this.baseUrl = baseUrl;
  }

  ngOnInit(): void {
    this.getTeachers();
    this.getCourses();
    this.getClasses();
    this.classForm = this.fb.group({
      classList: this.fb.array([])
    });
  }

  get classesForm() {
    return this.classForm.get('classList') as FormArray
  }

  updateClass(f: FormGroup) {
    //var data = JSON.stringify(f.get('courseList').value);
    var data = JSON.stringify((f.getRawValue())['classList']);
    console.log(data);
    var headers = new HttpHeaders().set("Content-Type", "application/json");
    return this.client.post<Class[]>(this.baseUrl + "admin/UpdateClass",
      data, { headers })
      .subscribe(res => {
      }, err => {
        this.errMsg = err;
        console.error(err);
      });
  }

  addClass() {
    const cl = this.fb.group({
      classId: ['', Validators.required, Validators.maxLength(10)],
      courseId: ['', Validators.required],
      teacherId: ['', Validators.required],
      numOfStudent: ['', Validators.required]
    })
    this.classesForm.push(cl);
  }

  deleteClass(i) {
    var toBeDeleted = (this.classesForm.getRawValue())[i];
    console.log(toBeDeleted);
    var data = JSON.stringify(toBeDeleted);
    var headers = new HttpHeaders().set("Content-Type", "application/json");
    this.client.post<Class>(this.baseUrl + "admin/RemoveClass",
      data, { headers })
      .subscribe(res => {
      }, err => {
        this.errMsg = err;
        console.error(err);
      });
    this.classesForm.removeAt(i);
  }

  getClasses() {
    this.isLoaded = false;
    return this.client.get<Class[]>(this.baseUrl + "class/GetClasses").subscribe(
      res => {
        this.classes = res;
        this.classes.forEach(
          (c) => this.classesForm.push(this.fb.group({
            classId: [{ value: c.classId, disabled: true }],
            courseId: c.courseId,
            teacherId: c.teacherId,
            numOfStudent: c.numOfStudent
          }))
        )
        this.isLoaded = true;
      }, err => {
        console.error(err);
      }
    );
  }

  getCourses() {
    this.client.get<Course[]>(this.baseUrl + ("course/GetCourses"))
      .subscribe(
        res => {
          this.courses = res;
          console.log(res);
        },
        err => console.error(err)
      )
  }

  getTeachers() {
    this.client.get<Teacher[]>(this.baseUrl + ("admin/GetTeachers"))
      .subscribe(
        res => {
          this.teachers = res;
          console.log(res);
        },
        err => console.error(err)
      )
  }

}
interface Class {
  classId: string,
  courseId: string,
  teacherId: string,
  numOfStudent: number,
}

interface Teacher {
  TeacherId: string,
}

interface Course {
  CourseId: string
}


