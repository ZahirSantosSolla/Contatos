const contactTableBody = document.getElementById("contactTableBody");
const qrCodeOverlay = document.getElementById("qrCodeOverlay");
const qrCodeContainer = document.getElementById("qrCode");
const contactModal = new bootstrap.Modal(document.getElementById("contactModal"));
let editingContactIndex = -1;
let contacts = [];

function saveContactsToLocalStorage() {
  localStorage.setItem('contacts', JSON.stringify(contacts));
}

function loadContactsFromLocalStorage() {
  const storedContacts = localStorage.getItem('contacts');
  if (storedContacts) {
    contacts = JSON.parse(storedContacts);
  }
}

function renderContacts() {
  contactTableBody.innerHTML = "";
  contacts.forEach((contact, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${contact.name}</td>
      <td>${contact.phone}</td>
      <td>
        <button class="btn btn-sm btn-success me-2" onclick="generateQRCode('${contact.phone}')">QR Code</button>
        <button class="btn btn-sm btn-warning me-2" onclick="editContact(${index})">Alterar</button>
        <button class="btn btn-sm btn-danger" onclick="deleteContact(${index})">Excluir</button>
      </td>
    `;

    contactTableBody.appendChild(row);
  });
}

function showAddContactForm() {
  editingContactIndex = -1;
  document.getElementById("contactName").value = "";
  document.getElementById("contactPhone").value = "";
  document.getElementById("contactModalLabel").innerText = "Adicionar Contato";
  contactModal.show();
}

function saveContact() {
  const name = document.getElementById("contactName").value;
  const phone = document.getElementById("contactPhone").value;

  clearErrors();

  if (!name || !phone) {
    if (!name) {
      document.getElementById("contactName").classList.add("is-invalid");
    }
    if (!phone) {
      document.getElementById("contactPhone").classList.add("is-invalid");
    }
    return;
  }

  const namePattern = /^[A-Za-zÀ-ÿ\s]+$/;
  if (!namePattern.test(name)) {
    document.getElementById("contactName").classList.add("is-invalid");
    return;
  }

  const phonePattern = /^[0-9]+$/;
  if (!phonePattern.test(phone)) {
    document.getElementById("contactPhone").classList.add("is-invalid");
    return;
  }

  if (editingContactIndex === -1) {
    contacts.push({ name, phone });
  } else {
    contacts[editingContactIndex] = { name, phone };
  }

  saveContactsToLocalStorage();

  renderContacts();
  contactModal.hide();
}

function deleteContact(index) {
  contacts.splice(index, 1);

  saveContactsToLocalStorage();

  renderContacts();
}

function editContact(index) {
  editingContactIndex = index;
  const contact = contacts[index];
  document.getElementById("contactName").value = contact.name;
  document.getElementById("contactPhone").value = contact.phone;
  document.getElementById("contactModalLabel").innerText = "Editar Contato";
  contactModal.show();
}

function generateQRCode(phone) {
    const canvas = document.createElement('canvas');
    qrCodeContainer.innerHTML = "";
  
    const whatsappLink = `https://wa.me/${phone}`;
  
    QRCode.toCanvas(canvas, whatsappLink, { width: 200 }, (error) => {
      if (error) {
        console.error(error);
        return;
      }
      qrCodeContainer.appendChild(canvas);
    });
  
    qrCodeOverlay.style.display = "flex";
  }  

function closeQRCode() {
  qrCodeOverlay.style.display = "none";
}

function clearErrors() {
  const inputs = document.querySelectorAll("input");
  inputs.forEach(input => {
    input.classList.remove("is-invalid");
  });
}

document.getElementById("contactName").addEventListener("input", function (e) {
  e.target.value = e.target.value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
});

document.getElementById("contactPhone").addEventListener("input", function (e) {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById("contactPhone");
  const iti = window.intlTelInput(input, {
    initialCountry: "auto",
    geoIpLookup: function(callback) {
      fetch("https://ipinfo.io?token=YOUR_API_TOKEN")
        .then(response => response.json())
        .then(data => callback(data.country))
        .catch(() => callback("us"));
    },
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.15/js/utils.js"
  });
});

document.addEventListener("DOMContentLoaded", () => {
  loadContactsFromLocalStorage();
  renderContacts();
});