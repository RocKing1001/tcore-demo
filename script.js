let indicator = {
  active: document.getElementById("active"),
  alert: document.getElementById("alert"),
  error: document.getElementById("error"),
} 

let live = {
  display: document.getElementById("display"),
  remote: document.getElementById("remote"),
};

let uicomponents = {
  clock: document.getElementById("clock")
}

uicomponents.update = (Component, value) => {
  if (Component in uicomponents) uicomponents[Component].innerText = value;
}

live.remote.is = () => {
  live.remote.style.display = "auto"
}
live.remote.isnt = () => {
  live.remote.style.display = "none"
}

indicator.active.show = (online=true) => {
  indicator.active.style.display = "block"
  indicator.alert.style.display = "none"
  indicator.error.style.display = "none"
  
  if (online) {
    live.display.innerText = "Live"
  }
}
indicator.alert.show = () => {
  indicator.alert.style.display = "block"
  indicator.active.style.display = "none"
  indicator.error.style.display = "none"
}
indicator.error.show = (offline=true) => {
  indicator.error.style.display = "block"
  indicator.active.style.display = "none"
  indicator.alert.style.display = "none"
  
  if (offline) {
    live.display.innerText = "Offline"
  }
}

live.display.live = () => {
  live.display.innerText = "Live"
}
live.display.offline = () => {
  live.display.innerText = "Offline"
}

let buttons = {
  services: document.getElementById("servicesbtn"),
  createreq: document.getElementById("createreq"),
  lastsess: document.getElementById("lastsess"),
  configkeys: document.getElementById("configkeys"),
  reapi: document.getElementById("reapi"),
  logs: document.getElementById("logs"),
}
  
const item = (name) => (
`
  <div id="history_item" class="item">
    <span class="itemtitle">${name}</span>
    <span class="permsicons">
      <img src="mic.svg" width="24px" height="24px" />
      <img src="cam.svg" width="24px" height="24px" />
    </span>
  </div>
`
)

let itemslist = ""


function addRequest(name) {
  itemslist = itemslist.concat("", item(name))
  document.getElementById("itemslist").innerHTML = itemslist

}

// defaults
live.display.offline()

const modal = document.getElementById("modal");

modal.addEventListener("click", (e) => {
  if (e.target.id === "modal") {
    modal.style.visibility = "hidden"
  }
})

function createModal(content) {
  modal.style.visibility = "visible"
  document.getElementById("modal-content").innerText = content
}


// ARTUR, CODE HERE NOT ABOVE
// No... Fight me

/* --- SAPIClient --- */
class SAPIClient {
  constructor(url, port) {
      this.url = url;
      this.port = port;
  }

  update_status(data){
      if (this.url != 'http://localhost')
        {live.remote.is(); indicator.active.show();}
      else
        {live.remote.isnt(); indicator.active.show();}
      console.log(`[SAPIClient] Motd: ${data.motd}`)
  }

  connect_sapi() {
      console.log(`[SAPIClient] Attemting to connect to ${this.url} at ${this.port}`)
      $.ajax(
          {
              url: this.url + ":" + this.port.toString(),
              type: "GET",
              success: (function(result){
                  this.update_status(result);
              }).bind(this),
              error: function(error){
                  indicator.error.show()
                  console.log(`[SAPIClient] Failed to connect to the SAPI ${error}`);
              }
          }
      )
  }

  get_logs() {
    console.log("[SAPIClient] Requesting logs");
    $.ajax(
      {
          url: this.url + ":" + this.port.toString() + "/logger?lines=10",
          type: "GET",
          success: (function(result){
              console.log(result);
          }).bind(this),
          error: function(error){
              indicator.error.show()
              console.log(`[SAPIClient] Failed to connect to the SAPI ${error}`);
          }
      }
  )
  }

  parse_response(data) {
    console.log(
      `%c======[ Response ]======`,
      "color:green;font-family:system-ui;font-size:2rem;-webkit-text-stroke: 1px black;font-weight:bold"
    ); 
    console.log(data)
    console.log(
      `%c=======================`,
      "color:green;font-family:system-ui;font-size:2rem;-webkit-text-stroke: 1px black;font-weight:bold"
    ); 

  }

  send_rq(hook, action, func, data) {
    $.ajax(
      {     //?hook=ethereum&action=ethereum_balance&function=getBalance&params=0x00000000219ab540356cBB839Cbe05303d7705Fa
          url: this.url + ":" + this.port.toString() + `/asgard?hook=${hook}&action=${action}&function=${func}&params=${data}`,
          type: "GET",
          success: (function(result){
              this.parse_response(result);
          }).bind(this),
          error: function(error){
              indicator.error.show()
              console.log(`[SAPIClient] Failed to connect to the SAPI ${error}`);
          }
      })
  }
  
  
}
/* --- SAPIClient END --- */

/* --- Clock ---*/
function clock(){
  var currentTime = new Date()
  var hours = currentTime.getHours()
  var minutes = currentTime.getMinutes()

  if (minutes < 10){
      minutes = "0" + minutes
  }

  uicomponents.update("clock", hours + ":" + minutes)
  setTimeout(clock,1000);
}
/* --- Clock END ---*/


// indicator.active.show()
// indicator.alert.show()
// indicator.error.show()
// indicator.error.show(false)

// live.display.live()
// live.display.offline()

// live.remote.isnt()

// buttons.name.onclick = () => {
//
// }

// addRequest("Rin")
// addRequest("TT23's spy cam")



// Process request

function main() {
  // Start clock
  clock();
  
  // Connect to SAPI, assume remote
  const Client = new SAPIClient("http://20.56.72.151", 8080)
  Client.connect_sapi()

  buttons.logs.onclick = (_) => {
    Client.get_logs()
  }

  buttons.reapi.onclick = (_) => {
    Client.connect_sapi()
  }

  /* --- Form ---*/

  // Prevent from submitting
  $("#cr_form").submit(function(e) {
    e.preventDefault();
    // Grab data and reset values
    
    var hook = $("#cr_hook").val(); //$("#cr_hook").val("");
    var action = $("#cr_action").val(); //$("#cr_action").val("");
    var func = $("#cr_function").val(); //$("#cr_function").val("");
  
    var data = $("#cr_data").val();
    
    //console.log(hook, action, func, data)

    // Request
    var x = Client.send_rq(hook, action, func, data);
    console.log(x);
  });
}

main();

