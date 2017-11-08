import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, Events, Content, IonicPage } from 'ionic-angular';
import { Native } from "../../providers/native";
import { HttpService } from "../../providers/http-service";

/*
  Generated class for the Car page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage({
  defaultHistory: []
})
@Component({
  selector: 'page-car',
  templateUrl: 'car.html'
})
export class CarPage {
  goodsAttrIdArray: any = [];
  isEdit: boolean = false;
  carDetails: any;
  @ViewChild(Content) content: Content;

  // checkedArray: Array<number> = [];//rec_id
  goodsIdArray: Array<number> = [];//goods_id

  // allRecId: Array<number> = [];//rec_id
  // allGoodsId: Array<number> = [];//goods_id

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public native: Native,
    public alertCtrl: AlertController,
    public httpService: HttpService,
    public events: Events,
  ) {
    this.events.subscribe('car:update', () => {
      this.getFlowGoods();
    })
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad CarPage');
  }
  ngOnDestroy() {
    this.events.unsubscribe('car:update');
  }
  ngOnInit() {
    this.getFlowGoods();
  }
  getFlowGoods() {
    this.goodsIdArray = [];
    return this.httpService.getFlowGoods().then((res) => {
      if (res.status == 1) {
        this.carDetails = res;
        this.content.resize();
        this.isEdit = false;
      }
    })
  }
  /**
   * 下拉刷新
   * @param refresher 
   */
  doRefresh(refresher) {
    /* this.getFlowGoods().then(() => {
      setTimeout(() => {
        refresher.complete();
      }, 500);
    }) */
    setTimeout(() => {
      refresher.complete();
    }, 500);
    this.events.publish('car:update');
  }
  /**
   * 加减数量
   * @param event 点击事件=>商品数量
   * @param item 单个商品
   */
  numberChangeI(event, item) {
    this.native.showLoading();
    this.httpService.changeNumCart({ rec_id: item.rec_id, number: event }).then((res) => {
      if (res.status == 1) {
        item.inputLock = false;
      } else {
        item.inputLock = true;
      }
    }).then(() => {
      this.getFlowGoods().then(() => {
        this.native.hideLoading();
      });
    });
    // this.calculateTotal();
  }
  checkGoods(id, type, is_select) {
    this.httpService.selectChangePrice({ id: id, type: type, is_select: is_select }).then((res) => {
      this.getFlowGoods();
    })
  }
  checkGoodsAttr(rec_id, is_select) {
    this.httpService.changeProductNum({
      rec_id: rec_id,
      type: is_select
    }).then((res) => {
      if (res.status) {
        this.getFlowGoods();
      }
    })
  }
  check() {
    var goodsIds = [];
    var attrIds = [];

    for (let i = 0, item1 = this.carDetails.suppliers_goods_list; i < item1.length; i++) {//店铺列表
      for (let n = 0, item2 = item1[i].goods_list; n < item2.length; n++) {//商品列表
        if (item2[n].selected) {
          goodsIds.push(item2[n].goods_id);
        }
        for (let g = 0, item3 = item2[n].attrs; g < item3.length; g++) {//商品属性列表
          if (item3[g].selected) {
            attrIds.push(item3[g].rec_id);
          }
        }
      }
    }
    console.log(goodsIds, attrIds)
    return {
      goodsIds: goodsIds,
      attrIds: attrIds
    };
  }
  check1() {
    
  }
  check2() { }
  check3() { }
  check4() { }
  /* 关注商品 */
  beCareFor() {
    if (this.goodsIdArray.length == 0) {
      this.native.showToast('请选择需要关注商品');
      return;
    }
    this.httpService.batchGoodsCollect({
      goods_ids: this.goodsIdArray
    }).then((res) => {
      console.log(res);
      if (res.status == 1) {
        this.native.showToast('关注成功')
      }
    })
  }
  /**
   * 滑动删除商品
   * @param item3 
   */
  deleteItem(item3) {
    this.native.openAlertBox("确认删除该商品吗？", () => {
      this.httpService.dropCartGoodsSelect({ rec_id: item3.rec_id }).then((res) => {
        if (res.status == 1) {
          this.native.showToast('删除成功');
          this.events.publish('car:update');
        }
      })
    })
  }
  /* 删除购物车商品 */
  dropCartGoodsSelect() {
    if (!this.check().goodsIds.length && !this.check().attrIds.length) {
      this.native.showToast('请选择需要删除商品');
      return;
    }
    this.native.openAlertBox('删除购物车选中商品？', () => {
      this.httpService.dropCartGoodsSelect({ goods_ids: this.check().goodsIds, rec_ids: this.check().attrIds }).then((res) => {
        console.log(res);
        if (res.status == 1) {
          this.native.showToast('删除成功')
          this.events.publish('car:update');
          this.isEdit = false;
        }
      })
    })
  }
  /* 去结算 */
  goAccounts() {
    var arr = []
    for (let i = 0, item = this.carDetails.suppliers_goods_list; i < item.length; i++) {
      for (let k = 0; k < item[i].goods_list.length; k++) {
        if (!item[i].goods_list[k].is_select) {
          arr.push(item[i].goods_list[k].goods_id)
        }
      }
    }
    this.httpService.delNoShop({ goods_ids: arr }).then((res) => {
      if (res.status == 1) {
        // this.navCtrl.push('WriteOrdersPage');
        this.httpService.clearFlowOrder().then(() => {
          this.navCtrl.push('WriteOrdersPage');
        });
      }
    })
  }
  /* 转跳商品详情 */
  goParticularPage(id) {
    this.navCtrl.push('ParticularsPage', { goodsId: id })
  }
  /*————————————————————————————— 购物车总价格计算 —————————————————————————————————————*/
  /*  calculateTotal() {
      let total = 0;
      let number = 0;
      for (let i = 0, item = this.carDetails.suppliers_goods_list; i < item.length; i++) {
        this.calculateShopPrice(item[i]);
        total += item[i].subtotal;
        number += item[i].number;
      }
      this.carDetails.total.goods_amount = total;
      this.carDetails.total.real_goods_count = number;
      this.event.publish('user:carNumber', number);
    }
    calculateShopPrice(items) {//购物车小计
      let subtotal = 0;
      let number = 0;
      for (let i = 0, item = items.goods_list; i < item.length; i++) {//单个店铺的所有商品
        for (let j = 0; j < item[i].attrs.length; j++) {//单个商品的所有属性
          subtotal += Number(item[i].attrs[j].goods_number) * Number(item[i].attrs[j].goods_price.substr(1));
          number += Number(item[i].attrs[j].goods_number)
        }
      }
      items.goods_price_total = subtotal;
      items.goods_count = number;
    }*/
}
