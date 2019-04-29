import { Component } from '@angular/core';
import { Ng2ImgMaxService } from 'ng2-img-max';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'client';
  constructor(private ng2ImgMax: Ng2ImgMaxService) {}
  uploadedImage: File;

constructor(private ng2ImgMax: Ng2ImgMaxService) {}

onImageChange(event) {
  let image = event.target.files[0];

  this.ng2ImgMax.resizeImage(image, 400, 300).subscribe(
    result => {
      this.uploadedImage = new File([result], result.name);
    },
    error => {
      console.log('😢 Oh no!', error);
    }
  );
}
}
import { Component } from '@angular/core';
