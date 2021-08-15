import { Component, OnInit } from '@angular/core';
import {BackendService} from "../../backend.service";
import {PhoneGeoHashDateTimeCounts, StayTime} from "../../headerindex";
import {Router} from "@angular/router";

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit {

  displayPhonesGeoHashDataTime: PhoneGeoHashDateTimeCounts[] = [];
  expandSet = new Set<string>();

  //expandGeoHashDateTimes: StayTime[] | undefined = [];

  constructor(private router:Router, private service: BackendService) { }

  ngOnInit(): void {
   this.service.getResultPhoneGeoHashDataTime().subscribe(data => this.displayPhonesGeoHashDataTime = data);

   if (this.displayPhonesGeoHashDataTime.length <= 1){
     this.router.navigateByUrl("/");
   }
    //console.log(this.service.getResultPhoneGeoHashDataTime())
  }

  onExpandChange(geohash: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(geohash);
      //this.expandGeoHashDateTimes = this.displayPhonesGeoHashDataTime.find(e => e.geohash === geohash)?.dateTimes;

    } else {
      this.expandSet.delete(geohash);
      //this.expandGeoHashDateTimes = [];
    }
  }

}
