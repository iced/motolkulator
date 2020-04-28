function report(s) {
    document.getElementById("mcccontent").innerHTML = "&nbsp;<br>" + s;
}

function calculate(payments) {
    num = payments.length;
    num_small = 0;
    total_payments = 0;
    total_small_payments = 0;
    total_comission = 0;
    for (i = 0; i < num; i++) {
        payment = payments[i]["sum"];
        total_payments += payment;
        comission = payment * 0.06;
        if (comission < 1.1) {
            num_small += 1;
            total_small_payments += payment;                        
            total_comission += 1.1;
        } else {
            total_comission += comission;
        }
    }

    report("комиссия (всего)<br>&nbsp;&nbsp;&nbsp;&nbsp;" + total_comission.toFixed(0) + " BYN<br>&nbsp;&nbsp;&nbsp;&nbsp;" + ((total_comission * 100) / total_payments).toFixed(2) + "%<br>" +
           "комиссия (по >6%)<br>&nbsp;&nbsp;&nbsp;&nbsp;" + (num_small * 1.1).toFixed(0) + " BYN<br>&nbsp;&nbsp;&nbsp;&nbsp;" + ((1.1 * 100 * num_small) / total_small_payments).toFixed(2) + "%");
}

function fetch(url, acc, callback) {
    xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.onload = function() {
        if (xhr.status === 200) {
            res = xhr.response
            acc = acc.concat(res["data"]);
            if (res["links"]["next"] == null) {
                callback(acc);
            } else {
                report("считаем страницу " + res["meta"]["current_page"] + " из " + res["meta"]["last_page"]);
                fetch(res["links"]["next"], acc, callback);
            }
        } else {
            report("что то пошло не так");
        }
    };
    xhr.send();
}

function run(campaign) {
    url = "https://molamola.by/api/campaigns/" + campaign + "/payments";    
    fetch(url, [], function(data) {
        calculate(data);
    });
    return false;
}

function runext(campaign) {
    if (window.location.href.indexOf("/campaigns/") == -1) {
        return;
    }
    inj = '<section class="m-aside-item"><button id="mccbutton" type="button" class="a-btn a-btn--color-grey a-btn--size-middle a-btn--design-default" style="color:#ff0000;width:100%;"> <div class="ball-clip-rotate-multiple vue-loaders a-btn__loader" style="width:20px;height:20px;"><div style="width:20px;height:20px;border-width:calc(20px * 0.05714285714285714);top:calc(20px * -1 * 0.05714285714285714);left:calc(20px * -1 * 0.05714285714285714);border-left-color:inherit;border-right-color:inherit;"></div> <div style="width: calc(10px); height: calc(10px); border-width: calc(1.14286px); top: calc(3.85714px); left: calc(3.85714px); border-top-color: inherit; border-bottom-color: inherit;"></div></div> <span class="a-btn__text">Узнать Правду</span></button><div id="mcccontent"></div></section>';
    document.getElementsByClassName("m-aside")[0].insertAdjacentHTML("afterbegin", inj);
    document.getElementById("mccbutton").addEventListener("click", function() {
        run(campaign);
    });    
}

function checkchange() {
    new_campaign = window.location.href.match(/(\d+)/g);
    if (new_campaign != null) {
        new_campaign = new_campaign[0];
        if (new_campaign != campaign) {
            campaign = new_campaign;
            setTimeout(function() { runext(campaign); }, 2000);
        }
    }
    setTimeout(checkchange, 100);
}

campaign = null;
checkchange();
