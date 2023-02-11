import pagination from './Pagination.js';

let myModal = {};//可被拿來放 DOM 元素
let delModal = {};//可被拿來放 DOM 元素

const app = Vue.createApp({
        //資料
        data() {
            return {
                url: 'https://vue3-course-api.hexschool.io/v2',
                path: 'et-case',//請加入個人站點與 API Path
                products: [],
                tempProduct: {
                    imagesUrl: [],
                },
                isNew: false,//區分新增產品或編輯原有的產品
                page:{}
            }
        },
        components:{
            pagination,
        },
        //方法
        methods: {
            //確認是否登入
            checkLogin() {
                axios.post(`${this.url}/api/user/check`)
                    .then((res) => {
                        this.getProductData();
                        //console.log(res.data)
                        //登入成功，立即使用getProductData()此方法將products的資料渲染到畫面上
                    })
                    .catch((err) => {
                        alert(err.data.message);
                        //console.dir(err);
                        //登入失敗即立刻回到登入頁面
                        window.location = 'login.html';
                    })
            },
            getProductData(page =1) {//參數預設值
                axios.get(`${this.url}/api/${this.path}/admin/products/?page=${page}`)
                .then((res) => {
                    //console.log(res);//確認是否有正確取得遠端資料
                    this.products = res.data.products;
                    this.page = res.data.pagination;//將page的資訊存起來
                    //console.log(res.data);
                    //讓products這個原本是空陣列裝入從遠端取得res的資料裡的products
                })
                .catch((err) => {
                    alert(err.data.message);
                })
            },
            openModal(isNew, product) {
                if (isNew === 'new') {
                    //如果是新增產品
                    this.tempProduct = {
                        imagesUrl: [],
                    };
                    this.isNew = true;
                    myModal.show();
                } else if (isNew === 'edit') {
                    //如果是編輯產品
                    this.tempProduct = { ...product };//淺層複製
                    this.isNew = false;
                    myModal.show();
                } else if (isNew === 'del') {
                    //如果要刪除產品
                    this.tempProduct = { ...product };//淺層複製
                    delModal.show()
                }
            },
            updateProductData() {
                if(!this.isNew){
                    //編輯已存在產品
                    axios.put(`${this.url}/api/${this.path}/admin/product/${this.tempProduct.id}`,{ data: this.tempProduct })
                    .then((res) => {
                        alert( res.data.message);//宣告已更新產品
                        myModal.hide();//更新後，關掉視窗
                        this.getProductData();//重新取得產品資料
                    })
                    .catch((err) => {
                        alert(err.data.message);
                    })
                }else{
                    //新增產品資料
                    axios.post(`${this.url}/api/${this.path}/admin/product`,{data:this.tempProduct})
                    .then((res) => {
                        alert( res.data.message);//宣告已新增產品
                        myModal.hide();//確實新增後，關掉視窗
                        this.getProductData();//重新取得產品資料
                    })
                    .catch((err) => {
                        alert(err.data.message);
                    })
                }
            },
            delProductData() {
                //刪除產品資料
                axios.delete(`${this.url}/api/${this.path}/admin/product/${this.tempProduct.id}`)
                .then((res) => {
                    alert(res.data.message);//宣告產品已刪除
                    delModal.hide();//確實刪除後，關掉視窗
                    this.getProductData();//重新取得產品資料
                }).catch((err) => {
                    alert(err.data.message);
                })
            },
            createImages() {
                //新增圖片
                this.tempProduct.imagesUrl = [];
                this.tempProduct.imagesUrl.push('');
            },
        },
        //生命週期，要抓取dom元素使用mounted()
        mounted() {
            // 取出 Token
            const token =  document.cookie.replace(/(?:(?:^|.*;\s*)etToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
            axios.defaults.headers.common['Authorization'] = token;
            //打開頁面後立即啟動checkLogin()此方法
            this.checkLogin();
            myModal = new bootstrap.Modal(document.querySelector("#productModal"));//將新增或編輯產品的Modal實體化
            delModal = new bootstrap.Modal(document.querySelector("#delProductModal"));//將刪除產品的Modal實體化
        },
    });
    // 元件註冊   
    app.component('product-modal',{
        props:['tempProduct','updateProductData','isNew','createImages'],
        template:'#product-modal-template'
    // 元件註冊
    });
    app.component('del-product-modal',{
        props:['tempProduct','delProductData'],
        template:'#del-product-modal-template'
    });
    app.mount('#app');
