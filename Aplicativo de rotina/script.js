
let compras = JSON.parse(localStorage.getItem("nutriwork_compras")) || [];
let perfil = JSON.parse(localStorage.getItem("nutriwork_perfil")) || {};
let rotina = JSON.parse(localStorage.getItem("nutriwork_rotina")) || {};
let planejamento = JSON.parse(localStorage.getItem("nutriwork_planejamento")) || {};
let agua = Number(localStorage.getItem("nutriwork_agua")) || 0;
let metaAgua = Number(localStorage.getItem("nutriwork_meta_agua")) || 2000;
let metas = JSON.parse(localStorage.getItem("nutriwork_metas")) || {};

function mostrarTela(id) {
    const telas = document.querySelectorAll(".tela");

    telas.forEach(tela => tela.classList.remove("ativa"));

    const tela = document.getElementById(id);

    if (tela) {
        tela.classList.add("ativa");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function salvarDados(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

function salvarCompras() {
    salvarDados("nutriwork_compras", compras);
}

function salvarRotina() {
    salvarDados("nutriwork_rotina", rotina);
}

function salvarPlanejamentoDados() {
    salvarDados("nutriwork_planejamento", planejamento);
}

function obterGastoTotal() {
    return compras.reduce((total, item) => {
        return total + (Number(item.preco) || 0) * (Number(item.quantidade) || 0);
    }, 0);
}

const formPerfil = document.getElementById("formPerfil");

if (formPerfil) {
    formPerfil.addEventListener("submit", function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();

        if (perfil.email && perfil.email !== email) {
            alert("Este perfil já foi cadastrado neste navegador.");
            return;
        }

        perfil = {
            nome: document.getElementById("nome").value.trim(),
            email,
            idade: document.getElementById("idade").value,
            rotinaTrabalho: document.getElementById("rotinaTrabalho").value,
            horarioTrabalho: document.getElementById("horarioTrabalho").value.trim()
        };

        salvarDados("nutriwork_perfil", perfil);

        alert("Perfil salvo com sucesso! 💚");
        mostrarTela("tela2");
    });
}

document.getElementById("fotoPerfil").addEventListener("change", function(event) {
    const arquivo = event.target.files[0];

    if (!arquivo) return;

    const leitor = new FileReader();

    leitor.onload = function() {
        const preview = document.getElementById("previewFoto");

        preview.src = leitor.result;
        preview.style.display = "block";

        localStorage.setItem("nutriwork_foto", leitor.result);
    };

    leitor.readAsDataURL(arquivo);
});

const formRotina = document.getElementById("formRotina");

if (formRotina) {
    formRotina.addEventListener("submit", function(event) {
        event.preventDefault();

        rotina = {
            tempoRefeicao: document.getElementById("tempoRefeicao").value,
            orcamento: Number(document.getElementById("orcamento").value),
            cozinha: document.getElementById("cozinha").value,
            geladeira: document.getElementById("geladeira").value,
            microondas: document.getElementById("microondas").value,
            alimentacao: document.getElementById("alimentacao").value
        };

        salvarRotina();
        atualizarGastos();

        alert("Rotina salva com sucesso! 💙");
        mostrarTela("tela3");
    });
}

const formPlanejamento = document.getElementById("formPlanejamento");

if (formPlanejamento) {
    formPlanejamento.addEventListener("submit", function(event) {
        event.preventDefault();

        planejamento = {
            cafeManha: document.getElementById("cafeManha").value.trim(),
            almoco: document.getElementById("almoco").value.trim(),
            lanche: document.getElementById("lanche").value.trim(),
            jantar: document.getElementById("jantar").value.trim(),
            organizacaoSemanal: document.getElementById("organizacaoSemanal").value.trim()
        };

        salvarPlanejamentoDados();

        alert("Planejamento salvo! 🍎");
        mostrarTela("tela4");
    });
}

const formCompra = document.getElementById("formCompra");

if (formCompra) {
    formCompra.addEventListener("submit", function(event) {
        event.preventDefault();

        const produto = document.getElementById("produto").value.trim();
        const quantidade = Number(document.getElementById("quantidade").value);
        const unidade = document.getElementById("unidade").value;
        const preco = Number(document.getElementById("preco").value);

        if (
            produto === "" ||
            quantidade <= 0 ||
            unidade === "" ||
            !Number.isFinite(preco) ||
            preco < 0
        ) {
            alert("Preencha os dados corretamente.");
            return;
        }

        compras.push({
            id: Date.now(),
            produto,
            quantidade,
            unidade,
            preco
        });

        salvarCompras();
        renderizarCompras();
        atualizarGastos();

        formCompra.reset();
    });
}

function renderizarCompras() {
    const lista = document.getElementById("listaCompras");

    if (!lista) return;

    lista.innerHTML = "";

    compras.forEach(item => {
        const li = document.createElement("li");
        const texto = document.createElement("span");
        const botao = document.createElement("button");

        const subtotal = item.quantidade * item.preco;

        texto.textContent =
            `${item.produto} - ${item.quantidade} ${item.unidade} | ${formatarMoeda(subtotal)}`;

        botao.textContent = "Excluir";
        botao.type = "button";

        botao.addEventListener("click", function() {
            compras = compras.filter(compra => compra.id !== item.id);

            salvarCompras();
            renderizarCompras();
            atualizarGastos();
        });

        li.appendChild(texto);
        li.appendChild(botao);

        lista.appendChild(li);
    });

    document.getElementById("totalCompra").textContent =
        formatarMoeda(obterGastoTotal());
}

function atualizarGastos() {
    const orcamento = Number(rotina.orcamento) || 0;
    const gastoTotal = obterGastoTotal();
    const restante = orcamento - gastoTotal;

    document.getElementById("valorOrcamento").textContent =
        formatarMoeda(orcamento);

    document.getElementById("valorGasto").textContent =
        formatarMoeda(gastoTotal);

    document.getElementById("valorRestante").textContent =
        formatarMoeda(restante);

    document.getElementById("valorRestante").style.color =
        restante < 0 ? "#dc3545" : "#14734a";

    const percentual = orcamento > 0
        ? (gastoTotal / orcamento) * 100
        : 0;

    document.getElementById("progressoGasto").style.width =
        Math.min(percentual, 100) + "%";

    document.getElementById("mensagemGasto").textContent =
        restante < 0
            ? "⚠️ Você ultrapassou seu orçamento."
            : `💚 Você ainda tem ${formatarMoeda(restante)} disponíveis.`;
}

function adicionarAgua(quantidade) {
    agua += quantidade;

    localStorage.setItem("nutriwork_agua", agua);

    atualizarAgua();
}

function removerAgua() {
    agua = Math.max(0, agua - 200);

    localStorage.setItem("nutriwork_agua", agua);

    atualizarAgua();
}

function salvarMetaAgua() {
    const valor = Number(document.getElementById("metaAgua").value);

    if (!Number.isFinite(valor) || valor <= 0) {
        alert("Informe uma meta válida.");
        return;
    }

    metaAgua = valor;

    localStorage.setItem("nutriwork_meta_agua", metaAgua);

    atualizarAgua();

    alert("Meta de água salva! 💧");
}

function atualizarAgua() {
    document.getElementById("aguaTotal").textContent =
        agua.toLocaleString("pt-BR") + " ml";

    document.getElementById("aguaMetaTexto").textContent =
        "Meta: " + metaAgua.toLocaleString("pt-BR") + " ml";

    const percentual = Math.min((agua / metaAgua) * 100, 100);

    document.getElementById("progressoAgua").style.width =
        percentual + "%";
}

const formMetas = document.getElementById("formMetas");

if (formMetas) {
    formMetas.addEventListener("submit", function(event) {
        event.preventDefault();

        metas = {
            refeicoes: Number(document.getElementById("metaRefeicoes").value),
            marmitas: Number(document.getElementById("metaMarmitas").value),
            orcamento: Number(document.getElementById("metaOrcamento").value)
        };

        salvarDados("nutriwork_metas", metas);

        mostrarMetas();

        alert("Metas salvas! 🎯");
    });
}

function mostrarMetas() {
    const resumo = document.getElementById("resumoMetas");

    resumo.innerHTML = "";

    const itens = [
        ["Refeições planejadas", metas.refeicoes || 0],
        ["Marmitas semanais", metas.marmitas || 0],
        ["Orçamento semanal", formatarMoeda(metas.orcamento || 0)]
    ];

    itens.forEach(([titulo, valor]) => {
        const div = document.createElement("div");

        div.className = "gasto";

        const span = document.createElement("span");
        const strong = document.createElement("strong");

        span.textContent = titulo;
        strong.textContent = valor;

        div.appendChild(span);
        div.appendChild(strong);

        resumo.appendChild(div);
    });
}

function carregarDados() {
    const foto = localStorage.getItem("nutriwork_foto");

    if (foto) {
        const preview = document.getElementById("previewFoto");

        preview.src = foto;
        preview.style.display = "block";
    }

    if (perfil.nome) document.getElementById("nome").value = perfil.nome;
    if (perfil.email) document.getElementById("email").value = perfil.email;
    if (perfil.idade) document.getElementById("idade").value = perfil.idade;

    if (perfil.rotinaTrabalho) {
        document.getElementById("rotinaTrabalho").value = perfil.rotinaTrabalho;
    }

    if (perfil.horarioTrabalho) {
        document.getElementById("horarioTrabalho").value = perfil.horarioTrabalho;
    }

    if (rotina.tempoRefeicao) {
        document.getElementById("tempoRefeicao").value = rotina.tempoRefeicao;
    }

    if (rotina.orcamento !== undefined) {
        document.getElementById("orcamento").value = rotina.orcamento;
    }

    if (rotina.cozinha) document.getElementById("cozinha").value = rotina.cozinha;
    if (rotina.geladeira) document.getElementById("geladeira").value = rotina.geladeira;
    if (rotina.microondas) document.getElementById("microondas").value = rotina.microondas;
    if (rotina.alimentacao) document.getElementById("alimentacao").value = rotina.alimentacao;

    if (planejamento.cafeManha) document.getElementById("cafeManha").value = planejamento.cafeManha;
    if (planejamento.almoco) document.getElementById("almoco").value = planejamento.almoco;
    if (planejamento.lanche) document.getElementById("lanche").value = planejamento.lanche;
    if (planejamento.jantar) document.getElementById("jantar").value = planejamento.jantar;
    if (planejamento.organizacaoSemanal) document.getElementById("organizacaoSemanal").value = planejamento.organizacaoSemanal;

    document.getElementById("metaAgua").value = metaAgua;

    renderizarCompras();
    atualizarGastos();
    atualizarAgua();
    mostrarMetas();
}

document.addEventListener("DOMContentLoaded", carregarDados);