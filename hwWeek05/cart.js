const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'et-case';

Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
        VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
});

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
    generateMessage: VeeValidateI18n.localize('zh_TW'),
    validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});



const productModal = {
    //當id有變動時，取得遠端資料後，呈現modal
    props:['id', 'addToCart', 'openModal'],
    data() {
        return{
            modal:{},
            tempProduct:{},
            qty: 1,//請設定預設值，否則會呈現undefined
        };
    },
    template:'#userProductModal',
    watch:{
        id() {
            //console.log('productModal:', this.id);
            if(this.id) {
                axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`)
                .then(res => {
                    //console.log('單一產品', res.data.product);
                    this.tempProduct = res.data.product;
                    this.modal.show();
                });
            }

        },
    },
    methods:{
        hide() {
            this.modal.hide();
        }
    },
    mounted() {
        this.modal = new bootstrap.Modal(this.$refs.modal);//將modal實體化並賦予在modal上
        //監聽dom，當modal關閉時，要做其他事情
        this.$refs.modal.addEventListener('hidden.bs.modal', (event)  => {
            this.openModal('');
        });
        // this.modal.show();
    },
};

const app = Vue.createApp({
    data() {
        return{
            products:[],
            productId:'',
            cart:{},
            loadingItem:'',//存id
            user: {
                email: '',
                name: '',
                address: '',
                phone: ''
            },
        }
    },
    components:{
        productModal,
    },
    methods:{
        getProducts() {
            axios.get(`${apiUrl}/api/${apiPath}/products/all`)
                .then(res => {
                    //console.log('產品列表:', res.data.products);
                    this.products = res.data.products;
                })
        },
        openModal(id) {//將id傳入
            this.productId = id;
            //console.log('外層帶入 productId:', id);
        },
        addToCart(product_id, qty=1) {//當沒有傳入參數時，會使用預設值
            const data = {
                product_id,
                qty
            };
            axios.post(`${apiUrl}/api/${apiPath}/cart`,{data})
            .then(res => {
                let loader = this.$loading.show();
                    // simulate AJAX
                setTimeout(() => {
                        loader.hide()
                }, 500)
                //console.log('加入購物車:', res.data);
                this.$refs.productModal.hide();
                this.getCarts();//每次加入購物車，就重新取得購物車裡的資料
            });
        },
        getCarts() {
            axios.get(`${apiUrl}/api/${apiPath}/cart`)
                .then(res => {
                    //console.log('購物車:', res.data.data);
                    this.cart = res.data.data;
                })
        },
        updateCartItem(item) {//這裡有兩個id:一個是購物車的id；另一個是產品本身的id
            const data = {
                    product_id: item.product.id,//此為產品的id
                    qty: item.qty,
            };
            // console.log(data, item.id)
            this.loadingItem = item.id;
            axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, {data})//這裡的id的是購物車裡的id
                .then(res => {
                    //console.log('更新購物車:', res.data.data);
                    this.getCarts();
                    let loader = this.$loading.show();
                        // simulate AJAX
                    setTimeout(() => {
                            loader.hide()
                    }, 500)                     
                    this.loadingItem = '';
                })            
        },
        deleteCartItem(item) {
            this.loadingItem = item.id;
            axios.delete(`${apiUrl}/api/${apiPath}/cart/${item.id}`)
                .then(res => {
                    let loader = this.$loading.show();
                        // simulate AJAX
                    setTimeout(() => {
                            loader.hide()
                    }, 500)                   
                    //console.log('刪除購物車:', res.data.data);
                    this.loadingItem = '';
                    this.getCarts();
                })            
        },
        deleteAllCarts() {
            axios.delete(`${apiUrl}/api/${apiPath}/carts`)
                .then(res => {
                    let loader = this.$loading.show();
                        // simulate AJAX
                    setTimeout(() => {
                            loader.hide()
                    }, 500)
                    //console.log('清空購物車:', res.data.data);
                    this.loadingItem = '';
                    this.getCarts();
                })            
        },
        onSubmit() {
            console.log(this.user);
            let loader = this.$loading.show();
                // simulate AJAX
            setTimeout(() => {
                    loader.hide()
            }, 500)            
            this.deleteAllCarts();
        },
        isPhone(value) {
            const phoneNumber = /^(09)[0-9]{8}$/
            return phoneNumber.test(value) ? true : '需要正確的電話號碼'
        }
    },
    mounted() {
        this.getProducts();
        this.getCarts();
    }
});
//元件註冊
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);


app.use(VueLoading.LoadingPlugin);//作為插件
// app.component('loading', VueLoading.Component)//作為元件

app.mount('#app');
// console.log(VueLoading);確認是否有匯入