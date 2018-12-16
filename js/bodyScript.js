function save_options(){
    var selection = document.getElementById("hotkeys");
    var cHotkeyOption = selection[selection.selectedIndex].value;

    chrome.storage.local.set({
        hotkeyOption: cHotkeyOption
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
        hotkeyOption: "None"
    }, function(items){
        var selection = document.getElementById("hotkeys");
        for(var i=0; i<selection.length; i++){
            if(selection[i].value==items.hotkeyOption){
                selection.selectedIndex = i;
                break;
            }
        }
    });
}

document.getElementById("submit").addEventListener("click", save_options);
document.addEventListener('DOMContentLoaded', restore_options);
