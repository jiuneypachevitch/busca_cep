/* configuracoes iniciais */
const url = "https://viacep.com.br/ws/value/json/";
const form = document.querySelector("#form-cep");
const btnClear = document.querySelector("#btn-clean");
const inputCep = document.querySelector("#cep");
const tableAddress = document.querySelector("#table-enderecos");
const tbodyAddress = document.querySelector("#enderecos-tbody");
const startMessage = document.querySelector("#start-wrapper");

/* Carrega a lista de endereços armazenados, se houver ou atribui um vetor vazio */
let addressList = JSON.parse(localStorage.getItem("address")) || [];
/* Configura a tela de acordo com o conteudo do vetor */
function showHideTable() {
    if (addressList.length > 0) {
        btnClear.classList.add("d-block");
        btnClear.classList.remove("d-none");
        tableAddress.classList.remove("d-none");
        startMessage.classList.remove("d-block");
        startMessage.classList.add("d-none");
    } else {
        btnClear.classList.add("d-none");
        btnClear.classList.remove("d-block");
        tableAddress.classList.add("d-none");
        tableAddress.classList.remove("d-block");
        startMessage.classList.add("d-block");
        startMessage.classList.remove("d-none");
        tbodyAddress.innerHTML = "";
    }
}
/* Dispara os métodos na inicializacao */
showHideTable();
renderAddresses();

/* Listeners dos botoes */
form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!inputCep.value) {
        alert("O campo CEP precisa ser preenchido.");
        return;
    }
    findCep(inputCep.value);
    inputCep.value = null;
});

btnClear.addEventListener('click', (e) => {
    e.preventDefault();
    addressList.splice(0, addressList.length);
    localStorage.clear();
    showHideTable();
})
/* Converte o valor do cep para o formato adequado a chamada da api */
function preProcessCep(cep) {
    return cep.replace("-", "").trim()
}
/* Atribui o endereço a lista de endereços */
function saveAddress(address) {
    addressList = JSON.parse(localStorage.getItem("address")) || [];
    const {cep, logradouro, bairro, localidade, uf} = address;
    const addr = {
        cep,
        logradouro,
        bairro, 
        "localidade": `${localidade}/${uf}`
    };
    addressList.push(JSON.stringify(addr));
    localStorage.setItem("address", JSON.stringify(addressList));
    showHideTable();
    renderAddresses()
}
/* Gera as linhas da tabela de acordo com os endereços armazenados */
function renderAddresses() {
    tbodyAddress.innerHTML = "";
    addressList = JSON.parse(localStorage.getItem("address")) || [];
    addressList.forEach((item) => {
        const tableRow = document.createElement("tr");
        const {cep, logradouro, bairro, localidade } = JSON.parse(item);
        const addr = {cep, logradouro, bairro, localidade };
        Object.entries(addr).map(([key, value]) => {
            const tableColumn = document.createElement("td");
            tableColumn.innerText = value;
            tableRow.appendChild(tableColumn);
        });
        tbodyAddress.appendChild(tableRow);
    });
}
/* Verifica se já tem o cep buscado na lista de endereços */
function hasCep(cep) {
    return addressList.length == 0 ? false : addressList.find((item) => preProcessCep(JSON.parse(item).cep) === preProcessCep(cep));
}
/* Efetivamente realiza a chamada a API */
async function findCep(cep) {
    if (hasCep(cep)) { 
        alert(`O cep ${cep} já foi buscado e está na lista!` ) ;
        return;
    }
    const result = await fetch(url.replace("value", preProcessCep(cep)));
    const resultBody = await result.json();
    "erro" in resultBody ? alert(`O endereço correspondente ao CEP ${cep} não foi encontrado.`) : saveAddress(resultBody);
}
