document.addEventListener('DOMContentLoaded', () => {

    /* =========================
       ELEMENTOS DO DOM
    ========================== */
    const el = {
        selectPais1: document.getElementById('nomePaisA'),
        selectPais2: document.getElementById('nomePaisB'),
        flagPais1: document.getElementById('flagPaisA'),
        flagPais2: document.getElementById('flagPaisB'),

        populacao1: document.getElementById('populacaoA'),
        populacao2: document.getElementById('populacaoB'),
        taxa1: document.getElementById('taxaA'),
        taxa2: document.getElementById('taxaB'),
        displayPop1: document.getElementById('displayPopA'),
        displayPop2: document.getElementById('displayPopB'),

        btnSimular: document.getElementById('btnSimular'),

        resultsPanel: document.getElementById('resultsPanel'),
        chartPanel: document.getElementById('chartPanel'),

        anosTotal: document.getElementById('diasTotal'),
        paisVencedor: document.getElementById('paisVencedor'),
        paisSuperado: document.getElementById('paisPerdedor'),
        popFinal1: document.getElementById('populacaoAFinal'),
        popFinal2: document.getElementById('populacaoBFinal'),
        crescimento1: document.getElementById('crescimentoA'),
        crescimento2: document.getElementById('crescimentoB')
    };

    let paises = [];
    let grafico = null;

    /* =========================
       CARREGAR PAÍSES (CountriesNow)
    ========================== */
    async function carregarPaises() {
        try {
            const res = await fetch('https://countriesnow.space/api/v0.1/countries/flag/images');
            if (!res.ok) throw new Error();

            const json = await res.json();
            if (!json.data) throw new Error();

            paises = json.data
                .map(p => ({
                    nome: p.name,
                    codigo: p.iso2?.toLowerCase() || '',
                    bandeira: p.flag
                }))
                .filter(p => p.codigo)
                .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

            preencherSelect(el.selectPais1);
            preencherSelect(el.selectPais2);

            el.selectPais1.value = 'br';
            el.selectPais2.value = 'ar';

            atualizarBandeira(el.selectPais1, el.flagPais1);
            atualizarBandeira(el.selectPais2, el.flagPais2);

        } catch (e) {
            alert('Não foi possível carregar a lista de países.');
            console.error(e);
        }
    }

    function preencherSelect(select) {
        select.innerHTML = '';
        paises.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.codigo;
            opt.textContent = p.nome;
            select.appendChild(opt);
        });
    }

    function atualizarBandeira(select, img) {
        const pais = paises.find(p => p.codigo === select.value);
        if (pais) {
            img.src = pais.bandeira;
            img.alt = pais.nome;
        }
    }

    function nomePais(codigo) {
        return paises.find(p => p.codigo === codigo)?.nome || '';
    }

    /* =========================
       FORMATAÇÃO
    ========================== */
    function formatar(n) {
        return new Intl.NumberFormat('pt-BR').format(Math.round(n));
    }

    function atualizarDisplay() {
        el.displayPop1.textContent = `${formatar(el.populacao1.value)} habitantes`;
        el.displayPop2.textContent = `${formatar(el.populacao2.value)} habitantes`;
    }

    /* =========================
       SIMULAÇÃO
    ========================== */
    function simular() {

        let pop1 = Number(el.populacao1.value);
        let pop2 = Number(el.populacao2.value);
        const taxa1 = Number(el.taxa1.value) / 100;
        const taxa2 = Number(el.taxa2.value) / 100;

        const nome1 = nomePais(el.selectPais1.value);
        const nome2 = nomePais(el.selectPais2.value);

        if (pop1 <= 0 || pop2 <= 0 || taxa1 <= 0 || taxa2 < 0) {
            alert('Informe valores válidos para população e taxa.');
            return;
        }

        if (pop1 >= pop2 || taxa1 <= taxa2) {
            alert(`${nome1} precisa ter população menor e crescimento maior que ${nome2}.`);
            return;
        }

        const dados = { anos: [], p1: [], p2: [] };
        const ini1 = pop1;
        const ini2 = pop2;
        let anos = 0;

        while (pop1 <= pop2 && anos < 10000) {
            dados.anos.push(anos);
            dados.p1.push(pop1);
            dados.p2.push(pop2);
            pop1 *= 1 + taxa1;
            pop2 *= 1 + taxa2;
            anos++;
        }

        mostrarResultados(nome1, nome2, anos, pop1, pop2, ini1, ini2, dados);
    }

    /* =========================
       RESULTADOS
    ========================== */
    function mostrarResultados(n1, n2, anos, f1, f2, i1, i2, dados) {

        el.anosTotal.textContent = `${anos} anos`;
        el.paisVencedor.textContent = n1;
        el.paisSuperado.textContent = n2;
        el.popFinal1.textContent = formatar(f1);
        el.popFinal2.textContent = formatar(f2);
        el.crescimento1.textContent = `${(((f1 - i1) / i1) * 100).toFixed(1)}%`;
        el.crescimento2.textContent = `${(((f2 - i2) / i2) * 100).toFixed(1)}%`;

        el.resultsPanel.classList.remove('hidden');
        el.chartPanel.classList.remove('hidden');

        criarGrafico(n1, n2, dados);
    }

    /* =========================
       GRÁFICO
    ========================== */
    function criarGrafico(n1, n2, dados) {

        const ctx = document.getElementById('growthChart').getContext('2d');
        if (grafico) grafico.destroy();

        grafico = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dados.anos,
                datasets: [
                    { label: n1, data: dados.p1, borderWidth: 3 },
                    { label: n2, data: dados.p2, borderWidth: 3 }
                ]
            },
            options: { responsive: true }
        });
    }

    /* =========================
       EVENTOS
    ========================== */
    el.selectPais1.addEventListener('change', () => atualizarBandeira(el.selectPais1, el.flagPais1));
    el.selectPais2.addEventListener('change', () => atualizarBandeira(el.selectPais2, el.flagPais2));
    el.btnSimular.addEventListener('click', simular);
    el.populacao1.addEventListener('input', atualizarDisplay);
    el.populacao2.addEventListener('input', atualizarDisplay);

    atualizarDisplay();
    carregarPaises();
});
