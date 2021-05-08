const input = document.getElementById('todo-input');
var test = document.getElementById('todo-list')
var ITEM = function(item,iscomplete,index){
    this.item = item;
    this.iscomplete = iscomplete;
    this.index = index;
}
var count = 0;
var TODO = [];
var index = 0;

var del = document.getElementById('del');

//insert new item
input.onkeyup = function(event){
    if(event.keyCode === 13 && event.target.value !== ''){
        //create elements for new item
        const list = document.getElementById('todo-list');
        const itemNode = document.createElement('LI');
        const checkbox = document.createElement('DIV');
        const detail = document.createElement('H1');
        const x = document.createElement('IMG');
        const newlabel = document.createElement('LABEL');
        const newbutton = document.createElement('DIV');
        var left = document.getElementById("left");

        x.className = "todo-app__item-x";
        x.src = "img/x.png";
        x.id = "del";
        x.onclick = function delFunction(){
            console.log(this.parentElement.className);
            this.parentElement.remove();
            if(item.iscomplete == "false"){
                count--;
            }
            left.innerHTML = count + " left";
        };

        itemNode.className = "todo-app__item";
        itemNode.id = index;
        checkbox.className = "todo-app__checkbox";
        detail.className = "todo-app__item-detail";
        newlabel.htmlFor = "0";
        newbutton.id = "0";

        checkbox.innerHTML = '<label for="0"></label><div id="0"></div>';
        checkbox.onclick = function finish(){
            if(item.iscomplete == "false"){
                detail.style["textDecoration"] = "line-through";
                detail.style["opacity"] = 0.5;
                item.iscomplete = "true";
                newlabel.style["background"] = "#26ca299b";
                count--;
            }
            else{
                detail.style["textDecoration"] = "none";
                detail.style["opacity"] = 1;
                item.iscomplete = "false";
                newlabel.style["background"] = "rgba(99, 99, 99, 0.698)";
                count++;
            }
            left.innerHTML = count + " left";
        }

        //create item + append elements to item
        var item = new ITEM(event.target.value,"false",index);
        detail.innerText = event.target.value;
        TODO.push(item);
        event.target.value = '';
        count++;
        index++;

        list.appendChild(itemNode);
        itemNode.appendChild(checkbox);
        itemNode.appendChild(detail);
        itemNode.appendChild(x);
        checkbox.appendChild(newlabel);
        checkbox.appendChild(newbutton);
        left.innerHTML = count + " left";

    }
}

function delFunction(event){
    if(count>0){
        return true;
    }
    return false;
}


//footer functions
var all = document.getElementById("all");
var active = document.getElementById("active");
var completed = document.getElementById("completed");
var clean = document.getElementById("clean");
status = 1;
all.onclick = function(event){
    if (status != 1){
        all.style.removeProperty("background");
        active.style["background"] = "white";
        completed.style["background"] = "white";
        for(i = 0;i<TODO.length;i++){
                document.getElementById(TODO[i].index).style.display = "flex";
        }
        status = 1;
    }
}

active.onclick = function(event){
    if(status != 2){
        all.style["background"] = "white";
        active.style.removeProperty("background");
        completed.style["background"] = "white";
        for(i = 0;i<TODO.length;i++){
            if(TODO[i].iscomplete == "true"){
                document.getElementById(TODO[i].index).style.display = "none";
            }
            else{
                document.getElementById(TODO[i].index).style.display = "flex";
            }
        }
        status = 2;
    }
}

completed.onclick = function(event){
    if(status != 3){
        all.style["background"] = "white";
        active.style["background"] = "white";
        completed.style.removeProperty("background");
        for(i = 0;i<TODO.length;i++){
            if(TODO[i].iscomplete == "false"){
                document.getElementById(TODO[i].index).style.display = "none";
            }
            else{
                document.getElementById(TODO[i].index).style.display = "flex";
            }
        }
        status = 3;
    }
}

clean.onclick = function(event){
    for(i = 0;i<TODO.length;i++){
        if(TODO[i].iscomplete == "true"){
            document.getElementById(TODO[i].index).remove();
            TODO.splice(i,1);
        }
    }
}


//All setting
function def(){
    active.style["background"] = "white";
    completed.style["background"] = "white";
}