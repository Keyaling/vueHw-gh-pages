//在template加入{{page}}可直接確認外層資料是否有傳入內層;:key="page + 'page'"成立唯一值，避免重複；如果page === pages.current_page，就會套上active這個class
export default {
    props:['pages','getProductData'],
    template:`
    <nav aria-label="Page navigation example">
        <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled:!pages.has_pre }">
            <a class="page-link" href="#" aria-label="Previous" @click.prevent="getProductData(pages.current_page - 1)">
            <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
        <li class="page-item" 
        :class="{ active: page === pages.current_page}" v-for="page in pages.total_pages" :key="page + 'page'">
            <a class="page-link" href="#" @click.prevent="getProductData(page)">{{page}}</a>
        </li>
        <li class="page-item" :class="{ disabled:!pages.has_next }">
            <a class="page-link" href="#" aria-label="Next" @click.prevent="getProductData(pages.current_page + 1)">
            <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
        </ul>
    </nav>`
};