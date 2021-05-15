function save_options(){
    const singleHotkey = document.getElementById("hotkeys");
    const currentSingleHotkey = singleHotkey[singleHotkey.selectedIndex].value;

    const sort = document.getElementById("sort_method");
    const sortOption = sort[sort.selectedIndex].value;

    chrome.storage.local.set({
        hotkeyOption: currentSingleHotkey,
        sortOption: sortOption
    }, function(){
        var status = document.getElementById("status");
        status.textContent = "Saved";
        setTimeout(function(){
            status.textContent = "";
        }, 750);
    });
}

function restore_options(){
    chrome.storage.local.get({
        hotkeyOption: "None",
        sortOption: "None"
    }, function(items){
        var singleHotkey = document.getElementById("hotkeys");
        for(var i=0; i<singleHotkey.length; i++){
            if(singleHotkey[i].value == items.hotkeyOption){
                singleHotkey.selectedIndex = i;
                break;
            }
        }
        
        var sort = document.getElementById("sort_method");
        for(var i=0; i<sort.length; i++){
            if(sort[i].value == items.sortOption){
                sort.selectedIndex = i;
                break;
            }
        }
    });
}

document.getElementById("submit").addEventListener("click", save_options);
document.addEventListener('DOMContentLoaded', restore_options);
