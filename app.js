const {FileSystem} = require('./src/FileSystem');
const {Download} = require('./src/Download');
const path_tmp = 'data/temp/files/';
const url_data_files = [
    {
        file: 'Estados.json',
        url: 'https://raw.githubusercontent.com/felipefdl/cidades-estados-brasil-json/master/Estados.json'
    },
    {
        file: 'Cidades.json',
        url: 'https://raw.githubusercontent.com/felipefdl/cidades-estados-brasil-json/master/Cidades.json'
    },
];

function getDefaultDir(file = '') {
    return path_tmp.concat(file);
}

function mapsStatesWithCities(statesJson, citiesJson) {
    return statesJson.map((state) => {
        const cities = citiesJson.filter(city => {
            return city.Estado === state.ID;
        });
        return {...state, cities};
    });
}

/**
 * 1. Implementar um método que irá criar um arquivo JSON para cada estado representado no arquivo Estados.json,
 * e o seu conteúdo será um array das cidades pertencentes aquele estado, de acordo com o arquivo Cidades.json.
 * O nome do arquivo deve ser o UF do estado, por exemplo: MG.json.
 * @param states
 * @param path
 * @returns {Promise<void>}
 */
async function saveStatesToFile(states, path) {
    for (const state of states) {
        const fileName = `${path}${state.Sigla}.json`
        await FileSystem.create(fileName, JSON.stringify(state));
    }
}

/**
 * 2. Criar um método que recebe como parâmetro o UF do estado, realize a leitura do arquivo JSON correspondente e retorne
 * a quantidade de cidades daquele estado.
 * @param uf
 * @returns {Promise<number>}
 */
const countTotalCitiesByUf = (uf) => new Promise(async (resolve, reject) => {
    try {
        const state = await getCitiesByUf(uf);
        resolve(state.cities.length);
    } catch (e) {
        reject(e);
    }
})

/**
 * 3. Criar um método que imprima no console um array com o UF dos cinco estados que mais possuem cidades,
 * seguidos da quantidade, em ordem decrescente. Utilize o método criado no tópico anterior.
 * Exemplo de impressão: [“UF - 93”, “UF - 82”, “UF - 74”, “UF - 72”, “UF - 65”]
 * @returns {Promise<void>}
 */
async function getTop(states, total = 5) {
    const mapEstates = await mapTotalCitiesByStates(states, {by: 'total', order: 'DESC'});
    return mapEstates.slice(0, total);
}

/**
 * 4. Criar um método que imprima no console um array com o UF dos cinco estados que menos possuem cidades,
 * seguidos da quantidade, em ordem decrescente. Utilize o método criado no tópico anterior.
 * Exemplo de impressão: [“UF - 30”, “UF - 27”, “UF - 25”, “UF - 23”, “UF - 21”]
 * @param states
 * @param total
 * @returns {Promise<Buffer|SharedArrayBuffer|any[]|BigUint64Array|Uint8ClampedArray|Uint32Array|Blob|Int16Array|Float64Array|string|Uint16Array|ArrayBuffer|Int32Array|Float32Array|BigInt64Array|Uint8Array|Int8Array>}
 */
async function getBottom(states, total = 5) {
    const mapEstates = await mapTotalCitiesByStates(states, {by: 'total', order: 'ASC'});
    return mapEstates.slice(0, total);
}

/**
 * 5. Criar um método que imprima no console um array com a cidade de maior nome de cada estado, seguida de seu UF.
 * Em caso de empate, considerar a ordem alfabética para ordená-los e então retornar o primeiro.
 * Por exemplo: [“Nome da Cidade – UF”, “Nome da Cidade – UF”, ...].
 * @param statesJson
 */
async function getMaxNames(statesJson) {
    let names = await mapCitieNamesLength(statesJson, 'MAX', 1);
    return names.map(city =>{
       return `${city.name} - ${city.UF}`;
    });
}

/**
 * 6. Criar um método que imprima no console um array com a cidade de menor nome de cada estado, seguida de seu UF.
 * Em caso de empate, considerar a ordem alfabética para ordená-los e então retorne o primeiro.
 * Por exemplo: [“Nome da Cidade – UF”, “Nome da Cidade – UF”, ...].
 * @param statesJson
 */
async function getMinNames(statesJson) {
    let names = await mapCitieNamesLength(statesJson, 'MIN', 1);
    return names.map(city =>{
        return `${city.name} - ${city.UF}`;
    });
}

/**
 * 7. Criar um método que imprima no console a cidade de maior nome entre todos os estados, seguido do seu UF.
 * Em caso de empate, considerar a ordem alfabética para ordená-los e então retornar o primeiro. Exemplo: “Nome da Cidade - UF".
 * @param statesJson
 * @returns {Promise<Buffer|SharedArrayBuffer|any[]|BigUint64Array|Uint8ClampedArray|Uint32Array|Blob|Int16Array|Float64Array|string|Uint16Array|ArrayBuffer|Int32Array|Float32Array|BigInt64Array|Uint8Array|Int8Array>}
 */
async function getTopMaxName(statesJson) {
    let name = await getMaxNames(statesJson);

    return name.slice(0,1);
}

/**
 * 8. Criar um método que imprima no console a cidade de menor nome entre todos os estados, seguido do seu UF.
 * Em caso de empate, considerar a ordem alfabética para ordená-los e então retornar o primeiro. Exemplo: “Nome da Cidade - UF".
 * @param statesJson
 * @returns {Promise<Buffer|SharedArrayBuffer|any[]|BigUint64Array|Uint8ClampedArray|Uint32Array|Blob|Int16Array|Float64Array|string|Uint16Array|ArrayBuffer|Int32Array|Float32Array|BigInt64Array|Uint8Array|Int8Array>}
 */
async function getTopMinName(statesJson) {
    let name = await getMinNames(statesJson);

    return name.slice(0,1);
}

function showResult(mapStates) {
    const data = mapStates.map(state => {
        return `${state.UF} - ${state.total}`;
    });
    console.log(data);
}

const mapCitieNamesLength = (states, aggregate= 'MAX', total=1) => new Promise(async (resolve) => {

    let statesMapped = [];
    for (const state of states) {
        let {cities} = await getCitiesByUf(state.Sigla);
        cities = cities.map(city => {
            return {name: city.Nome, UF: state.Sigla, lengthName: city.Nome.length}
        })
        cities = cities.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });

        cities = cities.sort((a, b) => {
            if(aggregate.toUpperCase()==='MIN')
                return a.lengthName - b.lengthName;
            else
                return b.lengthName - a.lengthName;
        });

        statesMapped.push(...cities.slice(0,total));
    }
    statesMapped = statesMapped.sort(((a, b) => {
        return a.name.localeCompare(b.name);
    }));
    statesMapped = statesMapped.sort(((a, b) => {
        if(aggregate.toUpperCase()==='MIN')
            return a.lengthName - b.lengthName;
        else
            return b.lengthName - a.lengthName;
    }));
    resolve(statesMapped);
});

const mapTotalCitiesByStates = (states, sorter = {
    by: 'total',
    order: 'ASC'
}) => new Promise(async (resolve, reject) => {
    try {
        var resultMap = [];

        for (const state of states) {
            let total = await countTotalCitiesByUf(state.Sigla);
            resultMap.push({UF: state.Sigla, total});
        }
        resultMap = resultMap.sort((a, b) => {
            if (sorter.by.toLowerCase() === 'total') {
                if (sorter.order.toUpperCase() === 'DESC') {
                    return b.total - a.total;
                } else {
                    return a.total - b.total;
                }
            }
            if (sorter.by.toUpperCase() === 'UF') {
                if (sorter.order.toUpperCase() === 'DESC') {
                    return b.UF.localeCompare(a.UF)
                } else {
                    return a.UF.localeCompare(b.UF)
                }
            }

        });
        resolve(resultMap);
    } catch (e) {
        reject(e);
    }
});

async function getCitiesByUf(uf) {
    const fileName = getDefaultDir(uf.toUpperCase() + '.json');
    return await FileSystem.read(fileName);
}

async function setup() {
    try {

        const dir = await FileSystem.mkdir(path_tmp, true);

        for (const data of url_data_files) {
            await Download.curl(data.url, dir.concat(data.file));
        }
        const statesJson = await FileSystem.read(dir.concat('Estados.json'));
        const citiesJson = await FileSystem.read(dir.concat('Cidades.json'));

        const states = mapsStatesWithCities(statesJson, citiesJson);
        await saveStatesToFile(states, dir);
        let totalPA = await countTotalCitiesByUf('pa');
        const top5 = await getTop(statesJson);
        const bottom5 = await getBottom(statesJson);
        const maxNames = await getMaxNames(statesJson);
        const minNames = await getMinNames(statesJson);
        const topMax = await getTopMaxName(statesJson);
        const topMin = await getTopMinName(statesJson);

        console.log('Questão 01')
        await FileSystem.ls(path_tmp);
        console.log('Questão 02')
        console.log('PA: ',totalPA);
        console.log('Questão 03');
        showResult(top5);
        console.log('Questão 04')
        showResult(bottom5);
        console.log('Questão 05')
        console.log(maxNames);
        console.log('Questão 06')
        console.log(minNames);
        console.log('Questão 07')
        console.log(topMax);
        console.log('Questão 08')
        console.log(topMin);


    } catch (e) {
        console.log(e);
    } finally {
        console.log('Removendo arquivos temporários...')
        await FileSystem.rmDir('data');
    }
}

setup();


