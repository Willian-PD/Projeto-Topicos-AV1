"use strict";

import ModelError from "/ModelError.js";
import TrabalhoEscolar from "/TrabalhoEscolar.js";

export default class DaoTrabalhoEscolar {

    //-----------------------------------------------------------------------------------------//

    static conexao = null;

    constructor() {
        this.arrayTrabalhosEscolares = [];
        this.obterConexao();
    }

    /*
    *  Devolve uma Promise com a referência para o BD
    */ 
    async obterConexao() {
        if(DaoTrabalhoEscolar.conexao == null) {
            DaoTrabalhoEscolar.conexao = new Promise(function(resolve, reject) {
            let requestDB = window.indexedDB.open("TrabalhoEscolarDB", 1); 

            requestDB.onupgradeneeded = (event) => {
            let db = event.target.result;
            let store = db.createObjectStore("TrabalhoEscolarST", {
                autoIncrement: true
            });
            store.createIndex("idxMatriculaAluno", "matriculaAluno", { unique: true });
            };

            requestDB.onerror = event => {
            reject(new ModelError("Erro: " + event.target.errorCode));
            };

            requestDB.onsuccess = event => {
            if (event.target.result) {
                // event.target.result apontará para IDBDatabase aberto
                resolve(event.target.result);
            }
            else 
                reject(new ModelError("Erro: " + event.target.errorCode));
            };
        });
        }
        return await DaoTrabalhoEscolar.conexao;
    }

    //-----------------------------------------------------------------------------------------//

    async obterTrabalhosEscolares() {
        let connection = await this.obterConexao();      
        let promessa = new Promise(function(resolve, reject) {
            let transacao;
            let store;
            let indice;
            try {
                transacao = connection.transaction(["TrabalhoEscolarST"], "readonly");
                store = transacao.objectStore("TrabalhoEscolarST");
                indice = store.index('idxMatriculaAluno');
            } 
            catch (e) {
                reject(new ModelError("Erro: " + e));
            }
            let array = [];
            indice.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {        
                const novo = TrabalhoEscolar.assign(cursor.value);
                array.push(novo);
                cursor.continue();
                } else {
                resolve(array);
                }
            };
        });
        this.arrayTrabalhosEscolares = await promessa;
        return this.arrayTrabalhosEscolares;
    }

    //-----------------------------------------------------------------------------------------//

    async obterTrabalhoEscolarPelaMatriculaAluno(matriculaAluno) {
        let connection = await this.obterConexao();      
        let promessa = new Promise(function(resolve, reject) {
            let transacao;
            let store;
            let indice;
            try {
                transacao = connection.transaction(["TrabalhoEscolarST"], "readonly");
                store = transacao.objectStore("TrabalhoEscolarST");
                indice = store.index('idxMatriculaAluno');
            } 
            catch (e) {
                reject(new ModelError("Erro: " + e));
            }

            let consulta = indice.get(matriculaAluno);
            consulta.onsuccess = function(event) { 
                if(consulta.result != null)
                resolve(TrabalhoEscolar.assign(consulta.result)); 
                else
                resolve(null);
            };
            consulta.onerror = function(event) { reject(null); };
        });
        let trabalhoEscolar = await promessa;
        return trabalhoEscolar;
    }

    //-----------------------------------------------------------------------------------------//

    async obterTrabalhosEscolaresPeloAutoIncrement() {
        let connection = await this.obterConexao();      
        let promessa = new Promise(function(resolve, reject) {
        let transacao;
        let store;
        try {
            transacao = connection.transaction(["TrabalhoEscolarST"], "readonly");
            store = transacao.objectStore("TrabalhoEscolarST");
        } 
        catch (e) {
            reject(new ModelError("Erro: " + e));
        }
        let array = [];
        store.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {        
            const novo = TrabalhoEscolar.assign(cursor.value);
            array.push(novo);
            cursor.continue();
            } else {
            resolve(array);
            }
        };
        });
        this.arrayTrabalhosEscolares = await promessa;
        return this.arrayTrabalhosEscolares;
    }

     //-----------------------------------------------------------------------------------------//

  async incluir(trabalhoEscolar) {
    let connection = await this.obterConexao();      
    let resultado = new Promise( (resolve, reject) => {
      let transacao = connection.transaction(["TrabalhoEscolarST"], "readwrite");
      transacao.onerror = event => {
        reject(new ModelError("Não foi possível incluir o trabalho", event.target.error));
      };
      let store = transacao.objectStore("TrabalhoEscolarST");
      let requisicao = store.add(TrabalhoEscolar.deassign(trabalhoEscolar));
      requisicao.onsuccess = function(event) {
          resolve(true);              
      };
    });
    return await resultado;
  }

  //-----------------------------------------------------------------------------------------//

  async alterar(trabalhoEscolar) {
    let connection = await this.obterConexao();      
    let resultado = new Promise(function(resolve, reject) {
      let transacao = connection.transaction(["TrabalhoEscolarST"], "readwrite");
      transacao.onerror = event => {
        reject(new ModelError("Não foi possível alterar o trabalho", event.target.error));
      };
      let store = transacao.objectStore("TrabalhoEscolarST");     
      let indice = store.index('idxMatriculaAluno');
      var keyValue = IDBKeyRange.only(trabalhoEscolar.getMatriculaAluno());
      indice.openCursor(keyValue).onsuccess = event => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.matriculaAluno == trabalhoEscolar.getMatriculaAluno()) {
            const request = cursor.update(TrabalhoEscolar.deassign(trabalhoEscolar));
            request.onsuccess = () => {
              console.log("[DaoTrabalhoEscolar.alterar] Cursor update - Sucesso ");
              resolve("Ok");
              return;
            };
          } 
        } else {
          reject(new ModelError("Trabalho do aluno com matrícula " + trabalhoEscolar.getMatriculaAluno() + " não encontrado!",""));
        }
      };
    });
    return await resultado;
  }
  
  //-----------------------------------------------------------------------------------------//

  async excluir(trabalhoEscolar) {
    let connection = await this.obterConexao();      
    let transacao = await new Promise(function(resolve, reject) {
      let transacao = connection.transaction(["TrabalhoEscolarST"], "readwrite");
      transacao.onerror = event => {
        reject(new ModelError("Não foi possível excluir o trabalho", event.target.error));
      };
      let store = transacao.objectStore("TrabalhoEscolarST");
      let indice = store.index('idxMatriculaAluno');
      var keyValue = IDBKeyRange.only(trabalhoEscolar.getMatriculaAluno());
      indice.openCursor(keyValue).onsuccess = event => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.matriculaAluno == trabalhoEscolar.getMatriculaAluno()) {
            const request = cursor.delete();
            request.onsuccess = () => { 
              resolve("Ok"); 
            };
            return;
          }
        } else {
          reject(new ModelError("Trabalho do aluno com matrícula " + trabalhoEscolar.getMatriculaAluno() + " não encontrado!",""));
        }
      };
    });
    return false;
  }

  //-----------------------------------------------------------------------------------------//
}
