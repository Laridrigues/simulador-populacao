document.addEventListener('DOMContentLoaded', () => {

    /* =========================
       ELEMENTOS DO DOM
    ========================== */
    const elementos = {
        nomePaisA: document.getElementById('nomePaisA'),
        nomePaisB: document.getElementById('nomePaisB'),
        flagPaisA: document.getElementById('flagPaisA'),
        flagPaisB: document.getElementById('flagPaisB'),

        populacaoA: document.getElementById('populacaoA'),
        populacaoB: document.getElementById('populacaoB'),
        taxaA: document.getElementById('taxaA'),
        taxaB: document.getElementById('taxaB'),
        displayPopA: document.getElementById('displayPopA'),
        displayPopB: document.getElementById('displayPopB'),

        btnSimular: document.getElementById('btnSimular'),
        btnReset: document.getElementById('btnReset'),

        resultsPanel: document.getElementById('resultsPanel'),
        chartPanel: document.getElementById('chartPanel'),

        diasTotal: document.getElementById('diasTotal'),
        paisVencedor: document.getElementById('paisVencedor'),
        paisPerdedor: document.getElementById('paisPerdedor'),
        populacaoAFinal: document.getElementById('populacaoAFinal'),
        populacaoBFinal: document.getElementById('populacaoBFinal'),
        crescimentoA: document.getElementById('crescimentoA'),
        crescimentoB: document.getElementById('crescimentoB')
    };

    let paises = [];
    let growthChart = null;

    /* =========================
       PAÍSES + BANDEIRAS (ROBUSTO)
    ========================== */
    async function carregarPaises() {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all');

            if (!response.ok) throw new Error('Falha na API');

            const data = await response.json();

            paises = data
                .map(p => ({
                    nome: p.translations?.por?.common || p.name.common,
                    codigo: p.cca2?.toLowerCase()
                }))
                .filter(p => p.codigo)
                .sort((a, b) => a.nome.localeCompare(b.nome));

        } catch (error) {
            console.warn('API indisponível. Usando fallback local.');

            // FALLBACK LOCAL (nunca quebra)
            paises = [
                { nome: 'Brasil', codigo: 'br' },
                { nome: 'Argentina', codigo: 'ar' },
                { nome: 'Estados Unidos', codigo: 'us' },
                { nome: 'China', codigo: 'cn' },
                { nome: 'Índia', codigo: 'in' },
                { nome: 'Japão', codigo: 'jp' },
                { nome: 'Alemanha', codigo: 'de' },
                { nome: 'França', codigo: 'fr' },
                { nome: 'Reino Unido', codigo: 'gb' },
                { nome: 'Itália', codigo: 'it' }
            ];
        }

        preencherSelect(elementos.nomePaisA);
        preencherSelect(elementos.nomePaisB);

        elementos.nomePaisA.value = 'br';
        elementos.nomePaisB.value = 'ar';

        atualizarBandeira(elementos.nomePaisA, elementos.flagPaisA);
        atualizarBandeira(elementos.nomePaisB, elementos.flagPaisB);
    }

    function preencherSelect(select) {
        select.innerHTML = '';
        paises.forEach(pais => {
            const option = document.createElement('option');
            option.value = pais.codigo;
            option.textContent = pais.nome;
            select.appendChild(option);
        });
    }

    function atualizarBandeira(select, img) {
        img.src = `https://flagcdn.com/w40/${select.value}.png`;
        img.alt = select.value;
    }

    function nomePaisPorCodigo(codigo) {
        return paises.find(p => p.codigo === codigo)?.nome || '';
    }

    /* =========================
       FORMATAÇÃO
    ========================== */
    function formatarNumero(num) {
        return new Intl.NumberFormat('pt-BR').format(Math.round(num));
    }

    function atualizarDisplay() {
        elementos.displayPopA.textContent =
            formatarNumero(elementos.populacaoA.value) + ' habitantes';

        elementos.displayPopB.textContent =
            formatarNumero(elementos.populacaoB.value) + ' habitantes';
    }

    /* =========================
       SIMULAÇÃO
    ========================== */
    function executarSimulacao() {

        let popA = Number(elementos.populacaoA.value);
        let popB = Number(elementos.populacaoB.value);
        const taxaA = Number(elementos.taxaA.value) / 100;
        const taxaB = Number(elementos.taxaB.value) / 100;

        const nomeA = nomePaisPorCodigo(elementos.nomePaisA.value);
        const nomeB = nomePaisPorCodigo(elementos.nomePaisB.value);

        if (popA <= 0 || popB <= 0 || taxaA <= 0 || taxaB < 0) {
            alert('Valores inválidos.');
            return;
        }

        if (popA >= popB || taxaA <= taxaB) {
            alert('A população A deve ser menor e crescer mais rápido.');
            return;
        }

        const dados = { anos: [], a: [], b: [] };
        const popAInicial = popA;
        const popBInicial = popB;
        let anos = 0;

        while (popA <= popB && anos < 10000) {
            dados.anos.push(anos);
            dados.a.push(popA);
            dados.b.push(popB);

            popA *= 1 + taxaA;
            popB *= 1 + taxaB;
            anos++;
        }

        exibirResultados(nomeA, nomeB, anos, popA, popB, dados, popAInicial, popBInicial);
    }

    /* =========================
       RESULTADOS
    ========================== */
    function exibirResultados(nomeA, nomeB, anos, popA, popB, dados, iniA, iniB) {

        elementos.diasTotal.textContent = anos + ' anos';
        elementos.paisVencedor.textContent = nomeA;
        elementos.paisPerdedor.textContent = nomeB;
        elementos.populacaoAFinal.textContent = formatarNumero(popA);
        elementos.populacaoBFinal.textContent = formatarNumero(popB);
        elementos.crescimentoA.textContent = (((popA - iniA) / iniA) * 100).toFixed(1) + '%';
        elementos.crescimentoB.textContent = (((popB - iniB) / iniB) * 100).toFixed(1) + '%';

        elementos.resultsPanel.classList.remove('hidden');
        elementos.chartPanel.classList.remove('hidden');

        criarGrafico(nomeA, nomeB, dados);
    }

    /* =========================
       GRÁFICO
    ========================== */
    function criarGrafico(nomeA, nomeB, dados) {

        const ctx = document.getElementById('growthChart').getContext('2d');
        if (growthChart) growthChart.destroy();

        growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dados.anos,
                datasets: [
                    { label: nomeA, data: dados.a, borderWidth: 3 },
                    { label: nomeB, data: dados.b, borderWidth: 3 }
                ]
            },
            options: { responsive: true }
        });
    }

    /* =========================
       EVENTOS
    ========================== */
    elementos.nomePaisA.addEventListener('change', () =>
        atualizarBandeira(elementos.nomePaisA, elementos.flagPaisA)
    );

    elementos.nomePaisB.addEventListener('change', () =>
        atualizarBandeira(elementos.nomePaisB, elementos.flagPaisB)
    );

    elementos.btnSimular.addEventListener('click', executarSimulacao);
    elementos.populacaoA.addEventListener('input', atualizarDisplay);
    elementos.populacaoB.addEventListener('input', atualizarDisplay);

    atualizarDisplay();
    carregarPaises();
});