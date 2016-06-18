import {Page, Alert, NavController, Loading, Platform} from 'ionic-angular';
import {GoogleService} from '../../services/google';
import {Camera, Base64ToGallery} from 'ionic-native';
import {NgZone} from '@angular/core';

@Page({
    templateUrl: 'build/pages/home/home.html',
    providers: [GoogleService]
})
export class HomePage {
    public foundRepos;
    public base64Image;
    public noneResult:boolean = false;

    private loading;

    constructor(private google:GoogleService,
                private nav:NavController,
                private zone:NgZone,
                private platform:Platform) {
    }

    getPic(sourceType) {
        Camera.getPicture({
            sourceType: sourceType,
            destinationType: 0,
            allowEdit: true,
            correctOrientation: true
        }).then((data) => {
            this.zone.run(() => {
                this.base64Image = "data:image/jpeg;base64," + data;
                this.foundRepos = [];
                this.loading = Loading.create({
                    content: '处理中,请稍候...'
                });
                this.nav.present(this.loading);
                this.noneResult = false;
            });

            this.google.getImageSearchList(data)
                .subscribe(
                    data => {
                        this.zone.run(() => {
                            this.foundRepos = data.json().data;
                            // this.inProcess = false;

                            this.noneResult = this.foundRepos.length === 0;
                        });
                    }, err => {
                        let alert = Alert.create({
                            title: 'ERROR',
                            message: err.text(),
                            buttons: ['OK']
                        });
                        this.nav.present(alert);
                    }, () => {
                        this.dissmissLoading();
                    }
                );

            // setTimeout(() => {
            //     let alert = Alert.create({
            //         message: '服务器没有响应!',
            //         buttons: ['重试', '放弃']
            //     });
            //     this.nav.present(alert);
            //     this.dissmissLoading();
            // }, 20000);

        }, (err) => {
            let alert = Alert.create({
                title: 'ERROR',
                message: err.text(),
                buttons: ['OK']
            });
        })
    }

    getPicture() {
        // this.google.getImageSearchList(this.google.testImg)
        this.google.getImageSearchList("")
            .subscribe(
                data => {
                    this.zone.run(() => {
                        this.foundRepos = data.json().data;
                        // this.inProcess = false;

                        console.log(this.foundRepos);

                        this.noneResult = this.foundRepos.length === 0;
                    });
                }, err => {
                    let alert = Alert.create({
                        title: 'ERROR',
                        message: err.text(),
                        buttons: ['OK']
                    });
                    this.nav.present(alert);
                }, () => {
                    this.dissmissLoading();
                }
            );
    }

    getServerImageUrl(path) {
        return this.google.getServerImageUrl(path);
    }

    saveImage(path) {
        // let alert = Alert.create({
        //     title: '',
        //     message: '敬请期待!',
        //     buttons: ['OK']
        // });
        // this.nav.present(alert);
        //
        // Base64ToGallery.base64ToGallery(this.google.testImg).then(
        //     res => console.log("Saved image to gallery ", res),
        //     err => console.log("Error saving image to gallery ", err)
        // );

        var image = path.substring(path.lastIndexOf('/') + 1);
        this.loading = Loading.create({
            content: '图片保存中...'
        });
        this.nav.present(this.loading);

        this.google.getBase64(path)
            .subscribe(
                data => {
                    this.zone.run(() => {
                        var rtn = data.text();
                        // this.inProcess = false;


                        if (rtn.indexOf('error') == -1) {
                            Base64ToGallery.base64ToGallery(rtn).then(
                                res => {
                                    let alert = Alert.create({
                                        title: 'OK',
                                        message: '保存成功!',
                                        buttons: ['OK']
                                    });
                                    this.nav.present(alert);
                                },
                                err => {
                                    let alert = Alert.create({
                                        title: 'ERROR',
                                        message: err.text(),
                                        buttons: ['OK']
                                    });
                                    this.nav.present(alert);
                                }
                            );
                        } else {
                            let alert = Alert.create({
                                title: 'ERROR',
                                message: '服务器错误!',
                                buttons: ['OK']
                            });
                            this.nav.present(alert);
                        }
                    });
                }, err => {
                    let alert = Alert.create({
                        title: 'ERROR',
                        message: err.text(),
                        buttons: ['OK']
                    });
                    this.nav.present(alert);
                }, () => {
                    this.dissmissLoading();
                }
            );


        // const fileTransfer = new FileTransfer();
        // const imageLocation = encodeURI(path);
        //
        // let targetPath; // storage location depends on device type.
        //
        // // make sure this is on a device, not an emulation (e.g. chrome tools device mode)
        // if(!this.platform.is('cordova')) {
        //     return false;
        // }
        //
        // if (this.platform.is('ios')) {
        //     targetPath = cordova.file.documentsDirectory + image;
        // }
        // else if(this.platform.is('android')) {
        //     targetPath = cordova.file.dataDirectory + image;
        // }
        // else {
        //     // do nothing, but you could add further types here e.g. windows/blackberry
        //     return false;
        // }
        //
        // fileTransfer.download(imageLocation, targetPath,
        //     (result) => {
        //         const alertSuccess = Alert.create({
        //             title: 'Download Succeeded!',
        //             subTitle: `${image} was successfully downloaded to: ${targetPath}`,
        //             buttons: ['Ok']
        //         });
        //
        //         var base64Data: string = "";
        //
        //         var imageReader = new FileReader();
        //
        //
        //         imageReader.onloadend = function (evt) {
        //             this.base64ToGallery.base64ToGallery(base64Data, 'img_').then(
        //                 res => console.log("Saved image to gallery ", res),
        //                 err => console.log("Error saving image to gallery ", err)
        //             );
        //
        //             this.nav.present(alertSuccess);
        //         };
        //
        //         imageReader.readAsDataURL(targetPath);
        //
        //
        //     },
        //     (error) => {
        //         const alertFailure = Alert.create({
        //             title: 'Download Failed!',
        //             subTitle: `${image} was not successfully downloaded, please try again later`,
        //             buttons: ['Ok']
        //         });
        //
        //         this.nav.present(alertFailure);
        //     }
        // );
    }

    private dissmissLoading() {
        if (this.loading != null) {
            this.loading.dismiss();
            this.loading = null;
        }
    }
}