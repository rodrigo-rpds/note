var buttonAdicionar = document.querySelector('#buttonAdicinar');
var modalPost = document.querySelector('#modal-post');
var closeModalPost = document.querySelector('#close-modal-post');
var noteList = document.querySelector('#note-list');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');
var content = document.querySelector('#conteudo');
var data = new Date();
var dataFormatada = ("0" + data.getDate()).substr(-2) + "/" 
    + ("0" + (data.getMonth() + 1)).substr(-2) + "/" + data.getFullYear();
var videoPlayer = document.querySelector('#player');
var canvasElement = document.querySelector('#canvas');
var captureButton = document.querySelector('#capture-btn');
var imagePicker = document.querySelector('#image-picker');
var imagePickerArea = document.querySelector('#pick-image');
var picture;
var locationBtn = document.querySelector('#location-btn');
var locationLoader = document.querySelector('#location-loader');
var fetchedLocation = {lat: 0, lng: 0};
var h1 = document.querySelector('.h1');

locationBtn.addEventListener('click', function (event) {
  if (!('geolocation' in navigator)) {
    return;
  }
  var sawAlert = false;

  locationBtn.style.display = 'none';
  locationLoader.style.display = 'block';

  navigator.geolocation.getCurrentPosition(function (position) {
    locationBtn.style.display = 'inline-block';
    locationLoader.style.display = 'none';

    var url = "https://nominatim.openstreetmap.org/reverse?lat="+position.coords.latitude+"&lon="+position.coords.longitude+"&format=json&json_callback=preencherDados";

    var script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);

    document.querySelector('#location + label').classList.add('active');
  }, function (err) {
    console.log(err);
    locationBtn.style.display = 'inline-block';
    locationLoader.style.display = 'none';
    if (!sawAlert) {
      alert('Couldn\'t fetch location, please enter manually!');
      sawAlert = true;
    }
    fetchedLocation = {lat: 0, lng: 0};
  }, {enableHighAccuracy:true, timeout: 7000});
});

function preencherDados(dados){
  locationInput.value = (dados.address.city) ? dados.address.city : dados.address.city_district;
}

function initializeLocation() {
  if (!('geolocation' in navigator)) {
    locationBtn.style.display = 'none';
  }
}

function initializeMedia() {

  if (!('mediaDevices' in navigator)) {
    navigator.mediaDevices = {};   
  }

  if (!('getUserMedia' in navigator.mediaDevices)) {

    navigator.mediaDevices.getUserMedia = function(constraints) {
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (!getUserMedia) {     
        return Promise.reject(new Error('getUserMedia is not implemented!'));
      }

      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }
        

navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          var videoDevices = [0,0];
          var videoDeviceIndex = 0;
          devices.forEach(function(device) {
            console.log(device.kind + ": " + device.label +
              " id = " + device.deviceId);
            if (device.kind == "videoinput") {  
              videoDevices[videoDeviceIndex++] =  device.deviceId;    
            }
          });


          var constraints =  {width: { min: 320, max: 800},
          height: { exact: 240},
          deviceId: { exact: (videoDevices[1] ? videoDevices[1] : videoDevices[0])} 
        };
        return navigator.mediaDevices.getUserMedia({ video: constraints });

      })
        .then(stream => {
          if (videoPlayer.mozSrcObject !== undefined) {
            videoPlayer.mozSrcObject = stream;
            videoPlayer.style.display = 'block';
          } else if (videoPlayer.srcObject !== undefined) {
            videoPlayer.srcObject = stream;
            videoPlayer.style.display = 'block';
          } else {
            videoPlayer.src = stream;
            videoPlayer.style.display = 'block';
          }})
        .catch(function(err) {
          captureButton.style.display = 'none'; 
          imagePickerArea.style.display = 'block';
        });



  }// fim initializeMedia




captureButton.addEventListener('click', function(event) {
  canvasElement.style.display = 'block';
  videoPlayer.style.display = 'none';
  captureButton.style.display = 'none';
  var context = canvasElement.getContext('2d');
  context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
  videoPlayer.srcObject.getVideoTracks().forEach(function(track) {
    track.stop();
    picture = canvasElement.toDataURL('image/jpeg', 0.75);
  });
  if(!(picture == 'undefined')){
    picture
  }
});

imagePicker.addEventListener('change', function(event) {
  picture = event.target.files[0];
  if ( /\.(jpe?g|png|gif)$/i.test(picture.name) ) {
    var reader = new FileReader();

    reader.onloadend = function(e) {
      var image = new Image();
      // Resize the image
      image.src = e.target.result;

      image.onload = function() {

        var max_width = 320;
        var max_height = 240;
        var width = this.width;
        var height = this.height;
        if (width > height) {
            if (width > max_width) {
                height *= max_width / width;
                width = max_width;
            }
        } else {
            if (height > max_height) {
                width *= max_height / height;
                height = max_height;
            }
        }
        canvasElement.width = width;
        canvasElement.height = height;
        canvasElement.getContext('2d').drawImage(image, 0, 0, width, height);
        picture = canvasElement.toDataURL('image/jpeg', 0.75);

      }// image.onload
    }
    reader.readAsDataURL(picture);
  }
});


function openCreatePostModal(event) {
  event.preventDefault();
  modalPost.style.transform = 'translateY(0)';
  initializeMedia();
  initializeLocation();
}

function closeCreatePostModal() {
  modalPost.style.transform = 'translateY(100vh)';
  imagePickerArea.style.display = 'none';
  videoPlayer.style.display = 'none';
  canvasElement.style.display = 'none';
  locationBtn.style.display = 'inline-block';
  locationLoader.style.display = 'none';
  captureButton.style.display = 'inline-block';
  if (videoPlayer.srcObject) {
    videoPlayer.srcObject.getVideoTracks().forEach(function (track) {
      track.stop();
    });
  }
}

buttonAdicionar.addEventListener('click', openCreatePostModal);

closeModalPost.addEventListener('click', closeCreatePostModal);

function clearCards() {
  while(noteList.hasChildNodes()) {
    noteList.removeChild(noteList.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'col s12 m6 l3';
  cardWrapper.id =  data.id;

  var card = document.createElement('div');
  card.className = 'card sticky-action';

  cardWrapper.appendChild(card);

  var cardBoxImg = document.createElement('div');
  cardBoxImg.className = 'card-image waves-effect waves-block waves-light';
  var cardImg = document.createElement('img');
  cardImg.src = (data.picture) ? data.picture : "src/imagens/layout/imagem-default.jpg";

  card.appendChild(cardBoxImg);
  cardBoxImg.appendChild(cardImg);

  var cardContent = document.createElement('div');
  cardContent.className = 'card-content';
  var cardTitle = document.createElement('span');
  cardTitle.className = 'card-title activator';
  cardTitle.textContent = data.title;
  var cardIconMoreVert = document.createElement('i');
  cardIconMoreVert.className = 'material-icons right';
  cardIconMoreVert.textContent = 'more_vert';
  var cardDate = document.createElement('i');
  cardDate.className = 'date blue-text text-darken-2';
  cardDate.textContent = dataFormatada;

  card.appendChild(cardContent);
  cardContent.appendChild(cardTitle);
  cardContent.appendChild(cardDate);
  cardTitle.appendChild(cardIconMoreVert);

  var cardAction = document.createElement('div'); 
  cardAction.className = 'card-action';
  var cardActionButton = document.createElement('a'); 
  cardActionButton.className = 'waves-effect waves-light btn red';
  cardActionButton.id = 'excluir';
  cardActionButton.textContent = 'excluir';

 card.appendChild(cardAction);
 cardAction.appendChild(cardActionButton);

  var cardReveal = document.createElement('div'); 
  cardReveal.className = 'card-reveal';
  var cardTitleInside = document.createElement('span'); 
  cardTitleInside.className = 'card-title grey-text text-darken-4';
  cardTitleInside.textContent = data.title;
  var cardIconClose = document.createElement('i'); 
  cardIconClose.className = 'material-icons right';
  cardIconClose.textContent = 'close';
  var cardLocation = document.createElement('small'); 
  cardLocation.className = 'location blue-text text-darken-2';
  cardLocation.textContent = data.location;
  var cardTextContent = document.createElement('p');
  cardTextContent.textContent = data.content;

  card.appendChild(cardReveal);
  cardReveal.appendChild(cardTitleInside);
  cardReveal.appendChild(cardLocation);
  cardReveal.appendChild(cardTextContent);
  cardTitleInside.appendChild(cardIconClose);

  noteList.appendChild(cardWrapper);


  cardActionButton.addEventListener('click', function(){
   removeIten(this.parentNode.parentNode.parentNode.id);
  });
}

function removeIten(id){
  deleteItemFromData('posts', id);  
  readAllData('posts')
    .then(function(data) {
      console.log('From cache', data);
      updateUI(data);
      if(!(noteList.hasChildNodes())){
        h1.style.display = 'block';
      }
    });
}

function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
  if(noteList.hasChildNodes()){
    h1.style.display = 'none';
  }
}

if ('indexedDB' in window) {
  readAllData('posts')
    .then(function(data) {
      console.log('From cache', data);
      updateUI(data);
    });

    if(noteList.hasChildNodes()){
      h1.style.display = 'none';
    }
}



form.addEventListener('submit', function(event) {
  event.preventDefault();

  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Preencha todos os campos!');
    return;
  }


  $('.modal.open').modal('close')

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(function(sw) {
        var post = {
          id: new Date().toISOString(),
          title: titleInput.value,
          location: locationInput.value,
          content: content.value,
          picture: picture,
          rawLocation: fetchedLocation
        };
        writeData('posts', post);

        readAllData('posts')
        .then(function(data) {
          console.log('From cache', data);
          updateUI(data);
        });

        picture = null;
          
      })
      .catch(function(err) {
        console.log(err);
      });
  }

});