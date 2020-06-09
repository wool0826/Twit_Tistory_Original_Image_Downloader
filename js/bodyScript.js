function save_options(){
    const selection = document.getElementById("hotkeys");
    const cHotkeyOption = selection[selection.selectedIndex].value;

    const sort = document.getElementById("sort_method");
    const sortOption = sort[sort.selectedIndex].value;

    chrome.storage.local.set({
        hotkeyOption: cHotkeyOption,
        sortOption: sortOption
    }, function(){
        var status = document.getElementById("status");
        status.textContent = "저장되었습니다.(saved)";
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
        var selection = document.getElementById("hotkeys");
        for(var i=0; i<selection.length; i++){
            if(selection[i].value==items.hotkeyOption){
                selection.selectedIndex = i;
                break;
            }
        }

        var sort = document.getElementById("sort_method");
        for(var i=0; i<sort.length; i++){
            if(sort[i].value==items.sortOption){
                sort.selectedIndex = i;
                break;
            }
        }
    });
}

document.getElementById("submit").addEventListener("click", save_options);
document.addEventListener('DOMContentLoaded', restore_options);
