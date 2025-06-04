const activePage = window.location.pathname;

const form = document.querySelector('.form');
const customerNameInput = document.querySelector('#customer-name');
const regNoInput = document.querySelector('#vehicle-regNo');
const modelSelect = document.querySelector('#vehicle-model');
const jobTypeSelect = document.querySelector('#job-type');
const detailsInput = document.querySelector('#details');
const jobNoInput = document.querySelector('#ecpm'); 
const searchBar = document.querySelector('#search');

let allModels = [];

//Get Vehicle From Storage
function getVehicles() {
  let vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
  return vehicles;
}

//Capture Customer/Vehicle Details//

function onSubmit(e) {
  try {
    e.preventDefault();
    
    const vehicles = getVehicles();

    const customerName = customerNameInput.value.toUpperCase();
    const regNo = regNoInput.value.toUpperCase();
    const jobDetails = detailsInput.value.toUpperCase();
    const model = modelSelect.value.toUpperCase();
    const jobType = jobTypeSelect.value;
    const ecpmNo = jobNoInput.value;

    const editingId = form.dataset.editingId;

    const carModel = model.toLowerCase();

    //If editing vehicle//
    if(editingId) {
      const vehIndex = vehicles.findIndex((v) => v.id === Number(editingId));

      if (vehIndex >= 0) {
        vehicles[vehIndex] = {
          ...vehicles[vehIndex],
          name: customerName,
          regNo: regNo,
          vehicleModel: model,
          ECPM: ecpmNo,
          job: jobType,
          jobDesc: jobDetails,
          image: allModels.includes(carModel) 
            ? `/pics/${model.toLowerCase()}.png`
            : `/pics/toyota.png`
        }

      }
      //clearing the edit mode//  
      delete form.dataset.editingId;

      //Adding new vehicle//
    } else {
      if (customerName === "" || regNo === "") {
        alert('please fill in your details');
        return;
      }
      const newVehicle = {
        name: customerName,
        regNo: regNo,
        id: Date.now(),
        vehicleModel: model,
        ECPM: ecpmNo,
        job: jobType,
        jobDesc: jobDetails,
        image: allModels.includes(carModel) 
          ? `/pics/${model.toLowerCase()}.png`
          : `/pics/toyota.png`
      };

      vehicles.push(newVehicle);
    }
  
    localStorage.setItem('vehicles', JSON.stringify(vehicles));

    alertmessage();

    form.reset();

  } catch (error) {
  console.log(`Error Message:`,error);
  }
}

function alertmessage() {
  const alertDiv = document.getElementById('alert');
  alertDiv.innerHTML = `
      <div class="alert-success">
        ✅ Vehicle successfully added.
      </div>
  `;
  setTimeout(() => {
    alertDiv.innerHTML = '';
  }, 2500);
}

//Load vehicle models for selection//

async function loadModels() {
  try {
    const response = await fetch('/Vehicles/vehicle-data.json');
    const cars = await response.json();

    const model = document.querySelector('#vehicle-model');
    
    cars.forEach((car) => {
      const option = document.createElement('option');
      option.value = car.id;
      option.textContent = car.label;
      model.appendChild(option);
    });

    allModels = cars.map(car => car.id.toLowerCase());

  } catch (error) {
    console.log(`Error can not fetch model:`, error);
  }
}

//Display vehicle cards on Vehicle page//

function displayVehicles() {
  const CardContainer = document.querySelector('.card-section');

  const savedVehicles = getVehicles();

  CardContainer.innerHTML = '';

  savedVehicles.forEach((vehicle, index) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
    <a href="/vehicle-details.html?id=${vehicle.id}">
      <img src="${vehicle.image}" alt="${vehicle.vehicleModel}" style="width: 100%;">
    </a>
    <div class="card-body">
      <h4><b>REGNO: ${vehicle.regNo}</b></h4>
      <p><strong>MODEL: ${vehicle.vehicleModel}</strong></p>
      <p><strong>JOB-TYPE: ${vehicle.job}</strong></p>
      <button class ="del-btn" data-id="${vehicle.id}">X</button>
      <button class = "edit-btn" data-id="${vehicle.id}">Edit</button>
    </div>
    `;
    CardContainer.appendChild(div);
    console.log(`index:${index}, vehicle:${vehicle.regNo}`);
  });

  //Event Listeners//
  const delBtn = document.querySelectorAll('.del-btn');
  delBtn.forEach((button) => {
    button.addEventListener('click', (e) => {
      const idToDelete = Number(e.target.dataset.id);
      if (confirm('Are you sure you want to delete this vehicle?')) {
        deleteVehicle(idToDelete);
      }
    });
  });

  const editBtn = document.querySelectorAll('.edit-btn');

  editBtn.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const editId = Number(e.target.dataset.id);
       window.location.href = `/register.html?edit=${editId}`;
    });
  });
}

//Function to edit vehicle details//
function vehicleToEdit(id) {
  const vehicles = getVehicles();
  const vehicle = vehicles.find((v) => v.id === id);

  if (!vehicle) {
    return;
  }

  //vehicle details to fill form
  customerNameInput.value = vehicle.name;
  regNoInput.value = vehicle.regNo;
  modelSelect.value = vehicle.vehicleModel.toLowerCase(); // if your options use lowercase
  jobTypeSelect.value = vehicle.job;
  detailsInput.value = vehicle.jobDesc;
  jobNoInput.value = vehicle.ECPM;

  form.dataset.editingId = id;
}

//Activate Editingthe vehicle function//
function activateEdit() {
  const editParams = new URLSearchParams(window.location.search);
  const editId = editParams.get('edit');
  if (editId) {
    // Wait a tiny bit for model options to load before pre-filling
    setTimeout(() => {
      vehicleToEdit(Number(editId));
    }, 200); // 200ms delay to ensure dropdown options are loaded
  }
}


function searchVehicles() {
  const searchVeh = searchBar.value.trim();

  if (!searchVeh) {
    displayVehicles();
    return;
  }

  const vehicles = getVehicles();
  const vehicleSaved = vehicles.filter((veh) => {
    return veh.ECPM.toLowerCase().includes(searchVeh.toLowerCase());
    
  });
  // console.log(vehicleSaved);
  const CardContainer = document.querySelector('.card-section');

  CardContainer.innerHTML = '';

  vehicleSaved.forEach((vehicle) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
    <a href="/vehicle-details.html?id=${vehicle.id}">
      <img src="${vehicle.image}" alt="${vehicle.vehicleModel}" style="width: 100%;">
    </a>
    <div class="card-body">
      <h4><b>REGNO: ${vehicle.regNo}</b></h4>
      <p><strong>MODEL: ${vehicle.vehicleModel}</strong></p>
      <p><strong>JOB-TYPE: ${vehicle.job}</strong></p>
      <button class ="del-btn" data-id="${vehicle.id}">X</button>
      <button class = "edit-btn" data-id="${vehicle.id}">Edit</button>
    </div>
    `;
    CardContainer.appendChild(div);
  });
}

// jobNoInput.addEventListener('input', searchVehicles);

//Delete vehicle function//

function deleteVehicle(id) {
  
  const savedVehicles = getVehicles();

  const vehicles = savedVehicles.filter((vehicle) => {
    return vehicle.id !== id;
  });

  localStorage.setItem('vehicles', JSON.stringify(vehicles));

  displayVehicles();
}

//Display vehicle details
function displayDetails() {
  const params = new URLSearchParams(window.location.search);
  const veh_Id = params.get('id');

  const Card_info = document.querySelector('.card-info');

  const savedVehicles = getVehicles();
  
  const vehicle = savedVehicles.find((v) => v.id == veh_Id);

  if(!vehicle) {
    console.log('vehicle not found');
  } else {
      const div = document.createElement('div');
      div.classList.add('info-card');
      div.innerHTML = `
        <div>
          <img src="${vehicle.image}" alt="${vehicle.name}">
        </div>
        <br>
        <div class="int">
          <p >
            <strong>
              <h4>Customer Name: ${vehicle.name}</h4><br>
              <h4>Reg.No_: ${vehicle.regNo}</h4><br>
              <h4>Ecpm-No_: ${vehicle.ECPM}</h4><br>
              <h4>Model: ${vehicle.vehicleModel}<h4><br>
              Job-Type: ${vehicle.job}
            </strong>
          </p>
          <p>
          <strong>
            Job Desc:<br>
            ${vehicle.jobDesc}
          </strong>
          </p>
        </div>
      `;
    Card_info.appendChild(div);  
    console.log('found vehicle');
  }

}


//Initialise Page
async function initPage() {
  switch (activePage) {
    case '/':
    case '/index.html':
      console.log('HOMEPAGE!');
      break;
    case '/register.html':
      await loadModels();
      form.addEventListener('submit', onSubmit);
    activateEdit();
      console.log('REGISTER PAGE!!');
      break;
    case '/vehicles.html':
      displayVehicles();
      searchBar.addEventListener('input', searchVehicles);
      console.log('VEHICLES!!');
      break; 
    case '/vehicle-details.html':
      displayDetails();
      console.log('DETAILS-PAGE');
      break;
      
  }
}

document.addEventListener('DOMContentLoaded', initPage);