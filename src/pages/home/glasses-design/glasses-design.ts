import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content, Events } from 'ionic-angular';
import { HttpService } from "../../../providers/http-service";
import { ParticularsPage } from "../particulars/particulars";

/*
  Generated class for the GlassesDesign page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-glasses-design',
  templateUrl: 'glasses-design.html'
})
export class GlassesDesignPage {
  list: any;
  img: any;
  class: any;
  banner: any;
  @ViewChild(Content) content: Content;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public events: Events,
    public httpService: HttpService
  ) {
    this.getData();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GlassesDesignPage');
  }
  getData() {
    this.httpService.getHomebanner({ int_pos_id: 37 }).then((res) => {
      if (res.status == 1) {
        this.banner = res;
      }
      this.httpService.getHomebanner({ int_pos_id: 38 }).then((res) => {
        if (res.status == 1) {
          this.class = res;
        }
        this.httpService.getHomebanner({ int_pos_id: 39 }).then((res) => {
          if (res.status == 1) {
            this.img = res;
          }
          this.httpService.categoryGoods({ cat_id: 421 }).then((res) => {
            if (res.status == 1) {
              this.list = res;
            }
          })
        })
      })
    })
  }
  clickBanner(item) {
    if (item.link_type.type_name == 'category') {
      this.goClassPage('classify');
    } else if (item.link_type.type_name == 'goods') {
      this.navCtrl.push(ParticularsPage, {
        goodsId: item.link_type.type_value
      })
    } else if (item.link_type.type_name == "brand") {
      this.goClassPage('brand');
    }
  }
  goClassPage(value) {
    this.navCtrl.parent.select(1);
    this.events.publish('classify:selectSegment', value);
  }

  goParticularsPage(id) {
    this.navCtrl.push(ParticularsPage, { goodsId: id })
  }
  flag: boolean = true;
  doInfinite(infiniteScroll) {
    if (this.list.page < this.list.pages) {
      this.httpService.categoryGoods({ cat_id: 421, page: ++this.list.page }).then((res) => {
        if (res.status == 1) {
          Array.prototype.push.apply(this.list.goods, res.goods);
        }
        setTimeout(() => {
          infiniteScroll.complete();
        }, 500);
      })
    } else {
      this.flag = false;
    }
  }
  scrollToTop() {
    this.content.scrollToTop();
  }
}
