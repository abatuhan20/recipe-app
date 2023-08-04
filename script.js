const mealsEl = document.getElementById('meals');
const favoriteContainer = document.getElementById("fav-meals");

const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search');
const mealPopup = document.getElementById('meal-popup');
const mealInfoEl = document.getElementById('meal-info');
const popupCloseBtn = document.getElementById('close-popup');
// ÇARPI VE KALP BUTONUNA BASILINCA YEMEK TARİFİ VERMEYE DEVAM EDİYOR ONUN DÜZELTİLMESİ LAZIM

getRandomMeal();
fetchFavMeals();

//fetch fonksiyonunu kullanırken urlyi tam yazmak gerekiyor http:// veya https:// şeklinde
// URL yi eğer düz yazarsan ÇALIŞMAZ!!
async function getRandomMeal() {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");

    const respData = await resp.json();
    //.json(); metodu bir HTTP yanıtını JSON formatına çevirir.
    // Yani aldığım veri bir response nesnesi olarak geliyor.
    // Daha sonra bu nesneyi .json metodu ile gerçek veriye dönüştürüyorum.
    const randomMeal = respData.meals[0];
    //Burada ise aldığım veriyi array içerisine kaydediyorum randomMeal arrayi elde ediyorum.
    console.log(randomMeal);

    addMeal(randomMeal, true);
}

async function getMealById(id) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i="+id);

    const respData = await resp.json();
    const mealId = respData.meals[0];
    return mealId;
}

async function getMealsBySearch(term) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" +term);
    const respData = await resp.json();
    const meals = respData.meals;

    return meals;
}

//Parametre olarak mealData alacak ve default olarak false döndürecek.
function addMeal(mealData, random = false) {
    
    console.log(mealData);
    const meal = document.createElement('div');
    meal.classList.add('meal');
    // innerHTML yazarken `,` ve ; kullanmayı unutma aşağıdaki formatta
    // $ içerisindeki strMealThumb ve strMeal verileri apideki isimleri
    // Eğer ki random parametrem true ise random yemek yazısını basıyor.
    // Eğer random false ise "boş" basıyor.
    meal.innerHTML = `
        <div class="meal-header">
            ${
                random
                    ? `
            <span class="random"> Random Recipe </span>`
                    : ''
            }
            <img
                src="${mealData.strMealThumb}"
                alt="${mealData.strMeal}"
            />
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn" id="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;

    const btn = meal.querySelector(".meal-body .fav-btn");
    meal.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    btn.addEventListener("click", () => {
        if(btn.classList.contains("active")) {
            removeMealLS(mealData.idMeal);
            btn.classList.remove("active");
        }else {
            addMealLS(mealData.idMeal);
            btn.classList.add("active");
        }
        fetchFavMeals();
    });

    mealsEl.appendChild(meal);
    // Listenin sonuna meal node ekliyor. Meals'ı yukarıda constant olarak tanımlamıştım.
    
}

function addMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem('mealIds', JSON.stringify
    ([...mealIds, mealId]));
    //... kullanımı open array olduğunu gösteriyor
    // stringify JavaScript değerini json stringine dönüştürür.

}

function removeMealLS(mealId) {
    const mealIds = getMealsLS();
    
    localStorage.setItem("mealIds", JSON.stringify
    (mealIds.filter(id => id !== mealId)));
    // id nin mealId den farklı olduğu durumları filtreliyor

}

function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem
    ("mealIds"));
    // Bu metod ise stringifyin yaptığının tam tersini yapıyor
    // Yani jsonu javascript değerine dönüştürüyor.
    // Veriyi local storagedan almak için parse ls e eklemek için stringify

    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

    return mealIds === null ? [] : mealIds;
    // Bunu bi düşün console eğer null düşüyorsa kullanılabilir
}

 async function fetchFavMeals() {
    // Temizliyo içini
    favoriteContainer.innerHTML = '';
    const mealIds = getMealsLS();

    for(let i=0; i<mealIds.length; i++) {
        const mealId = mealIds[i];

        meal = await getMealById(mealId);

        addMealFav(meal);
    }

    console.log(meals);
}

function addMealFav(mealData) {
    // clean the container
    const favMeal = document.createElement("li");

    favMeal.innerHTML = `
       
            <img
                src="${mealData.strMealThumb}"
                alt="${mealData.strMeal}"
            /> <span> ${mealData.strMeal}" </span>
            <button class="clear"><i class="fa-solid fa-rectangle-xmark"></i>
            </button>
    `;
    const btn = favMeal.querySelector(".clear");
    
    btn.addEventListener("click", () => {
        removeMealLS(mealData.idMeal);
        galpKaldir();
        // TODO GALBİN RENGİNİ DEĞİŞTİRME LİSTEDEN ÇIKARINCA(
        fetchFavMeals();
    });
    
        favMeal.addEventListener("click", () => {
            showMealInfo(mealData);
        });
    
    favoriteContainer.appendChild(favMeal);
}

function galpKaldir() {
    const galp = document.getElementById("fav-btn");
    
    galp.classList.remove("active");
    
    
}

function showMealInfo(mealData) {
    // clean it up
    mealInfoEl.innerHTML = "";

    // update the Meal info
    const mealEl = document.createElement("div");

    const ingredients = [];

    // get ingredients and measures
    for (let i = 1; i <= 20; i++) {
        if (mealData["strIngredient" + i]) {
            ingredients.push(
                `${mealData["strIngredient" + i]} - ${
                    mealData["strMeasure" + i]
                }`
            );
        } else {
            break;
        }
    }
    

    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
        />
        <p>
        ${mealData.strInstructions}
        </p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients
                .map(
                    (ing) => `
            <li>${ing}</li>
            `
                )
                .join("")}
        </ul>
    `;

    mealInfoEl.appendChild(mealEl);

    // show the popup
    mealPopup.classList.remove("hidden");
}

searchBtn.addEventListener('click', async () => {
    mealsEl.innerHTML = '';
    const search = searchTerm.value;
    const meals = await getMealsBySearch(search);
    //clean container
    if (meals) {
        meals.forEach(meal => {
            addMeal(meal);
        });
    }
    // For each kullanabilmem için fonksiyonun async olması gerekiyor yoksa
    // fonksiyonu tanımıyor.

})

popupCloseBtn.addEventListener('click', async () => {
    mealPopup.classList.add('hidden');
});



