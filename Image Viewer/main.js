var imgArray = ['images/kyrie.jpg','images/curry.jpg','https://assets.entrepreneur.com/content/3x2/2000/20200213221411-GettyImages-79531645.jpeg','https://theundefeated.com/wp-content/uploads/2019/04/1142529063_34790848-e1555268637179.jpg?w=1400?w=145&quality=80']
var index = 0;

function loadImage() {
    var element = document.getElementsByClassName("image-viewer__button");
    var prevButtonDisable = document.getElementById("prevButton");
    var nextButtonDisable = document.getElementById("nextButton");
    //show image
    var img = document.getElementById('display');
    img.src = imgArray[index];
    //show source
    var source = document.getElementById('source');
    source.textContent = imgArray[index];

    //first image - disable back button
    if(index==0){
        prevButtonDisable.classList.add("disabled");
        console.log(prevButton.classList);
    }
    //last image - disable next button
    else if(index==imgArray.length-1){
        nextButtonDisable.classList.add("disabled");
    }
    else{
        prevButtonDisable.classList.remove("disabled");
        nextButtonDisable.classList.remove("disabled");
    }
}

function nextImage() {
    if(index<imgArray.length-1){
        index++;
        loadImage();
    }
}

function prevImage() {
    if(index>0){
        index--;
        loadImage();
    }
}