let restaurant;
var map;

/*
 * Initialisation
 */
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('1. DOMContentLoaded');
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      console.log('2. Initialization Perfect');
      fillBreadcrumb();
      loadStaticMap(self.restaurant);
    }
  });
});

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.InitializeIndexedDB((error,status) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Initialization Perfect');
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
          self.restaurant = restaurant;
          if (!restaurant) {
            console.error(error);
            return;
          }
          fillRestaurantHTML();
          callback(null, restaurant);
        });
      }
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const resto = document.getElementById('restaurant-img');
  const figure = document.createElement('figure');
  resto.append(figure);
  	const picture = document.createElement('picture');
  	figure.append(picture);

	   // Webp for Chrome
	  const source_800webp = document.createElement('source');
	  source_800webp.media = '(min-width:800px)';
	  source_800webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,800,'webp');
	  picture.append(source_800webp);
	  const source_400webp = document.createElement('source');
	  source_400webp.media = '(min-width:500px)';
	  source_400webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,400,'webp');
	  picture.append(source_400webp);
	  const source_300webp = document.createElement('source');
	  source_300webp.media = '(min-width:400px)';
	  source_300webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,300,'webp');
	  picture.append(source_300webp);
	  const source_200webp = document.createElement('source');
	  source_200webp.srcset = DBHelper.imageUrlForRestaurant(restaurant,200,'webp');
	  picture.append(source_200webp);
	  // Jpg for other
  	  const source_800jpg = document.createElement('source');
  	  source_800jpg.media = '(min-width:800px)';
  	  source_800jpg.srcset = DBHelper.imageUrlForRestaurant(restaurant,800,'jpg');
  	  picture.append(source_800jpg);
  	  const source_400jpg = document.createElement('source');
  	  source_400jpg.media = '(min-width:500px)';
  	  source_400jpg.srcset = DBHelper.imageUrlForRestaurant(restaurant,400,'jpg');
  	  picture.append(source_400jpg);
  const source_300jpg = document.createElement('source');
  	  source_300jpg.media = '(min-width:400px)';
  	  source_300jpg.srcset = DBHelper.imageUrlForRestaurant(restaurant,300,'jpg');
  	  picture.append(source_300jpg);
  	  const image = document.createElement('img');
  	  image.className = 'restaurant-img';
  	  image.src = DBHelper.imageUrlForRestaurant(restaurant,200,'jpg');
  image.alt = `${restaurant.name} restaurant's photo in ${restaurant.neighborhood}`;
  	  picture.append(image);
  	const figcaption = document.createElement('figcaption');
  figcaption.innerHTML =  `${restaurant.name} restaurant's photo in ${restaurant.neighborhood}`;
  figure.append(figcaption);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {

  const d = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    // Put in Strong the current day
    day.innerHTML = (key === days[d.getDay()]) ? '<strong>'+key+'</strong>' : key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);
    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  // TODO in Phase 2 : Pagination --> Display by default a max of 10 reviews, add a 'more' button if > 10 reviews
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);

  // add click event to un-blur
  reviewUnblur();
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  // Add class blur only if review.comments > 100 character ( 2 lines)
  if(review.comments.length > 100){li.className = 'blur';}
  const div = document.createElement('div');
  const info = document.createElement('div');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  info.appendChild(name);
  const date = document.createElement('p');
  date.innerHTML = review.date;
  info.appendChild(date);
  div.appendChild(info);
  const rating = document.createElement('span');
  rating.innerHTML = `Rating: ${review.rating}`;
  div.appendChild(rating);
  for (let indexCount = 0; indexCount < 5; indexCount++) {
    let rating = parseInt(review.rating);
    let star = document.createElement('i');
    star.className = rating > indexCount ? 'fa fa-star' : 'fa fa-star-o';
    div.appendChild(star);
  };
  li.appendChild(div);
  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);
  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb').getElementsByTagName('ol')[0];
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.setAttribute('href',`./restaurant.html?id=${restaurant.id}`);
  a.setAttribute('aria-current', 'page');
  a.setAttribute('tabindex', '0');
  a.innerHTML = restaurant.name;
  li.appendChild(a);
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url){url = window.location.href;}
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results){return null;}
  if (!results[2]){return '';}
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * Display Full review on Click
 */
reviewUnblur = () => {
  const review_blured = document.querySelectorAll('.blur');
  Array.from(review_blured).forEach(review => {
    review.addEventListener('click', function(event) {
      review.classList.remove('blur');
    });
  });
};

/**
 * Render alternative Static Map
 */
loadStaticMap = (restaurant) => {
  const lat = restaurant.latlng.lat;
  const lng = restaurant.latlng.lng;
  const zoom = 16;
  const height = 400;
  const width = 640;
  const maptype = 'roadmap';
  const key = 'AIzaSyC7PG4bxfY8ul6b8YLstueqFeI6eRnnVmk';
  const staticmap = document.createElement('img');
  let flag_scroll = 0;
  let markers = `&markers=color:0xff0000%7Clabel:${restaurant.name}%7C${lat},${lng}`;

  staticmap.alt = `NewYork City Map of Restaurants -${restaurant.name}`;
  staticmap.src = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=${maptype}&key=${key}&format=png&visual_refresh=true${markers}`;
  document.getElementById('map-static').append(staticmap);
  document.getElementById('map-static').style.display = 'block';

  // load now the google one
  document.getElementById('map-static').addEventListener('click', function(){
    includeAPI();
  });
  document.addEventListener('scroll', function(){
    if(flag_scroll === 0){
      flag_scroll++;
      includeAPI();
    }
  });

};

/*
 * Defer rending Include Google Maps API
* https://codepen.io/svinkle/pen/vJmlt
 */
includeAPI = () => {
  console.log('include Google API');
  const gkey = 'AIzaSyC7PG4bxfY8ul6b8YLstueqFeI6eRnnVmk';
  let js;
  let fjs = document.getElementsByTagName('script')[0];
  if (!document.getElementById('gmap-api')) {
    js = document.createElement('script');
    js.id = 'gmap-api';
    js.setAttribute('async', '');
    js.setAttribute('defer', '');
    js.src = 'https://maps.googleapis.com/maps/api/js?key='+gkey+'&sensor=false&libraries=places&force=pwa&callback=initMap';
    fjs.parentNode.insertBefore(js, fjs);
  }
};

/**
 * Initialize Google map, called from HTML.
 */
initMap = () => {
  if (navigator.onLine) {
    self.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 16,
      center: restaurant.latlng,
      scrollwheel: false
    });
    DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);

    console.log('Initialize GMap');
    const iframeloaded = document.querySelector('#map iframe') !== null;
    console.log('add title to iframe');
    if(iframeloaded){
      document.querySelector('#map iframe').setAttribute('title', 'New York City Map of Restaurants');
    }
  }
};
