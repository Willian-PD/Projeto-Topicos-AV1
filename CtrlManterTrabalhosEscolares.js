"use strict";

import Status from "/Status.js";
import TrabalhoEscolar from "/TrabalhoEscolar.js";
import DaoTrabalhoEscolar from "/DaoTrabalhoEscolar.js";
import ViewerTrabalhoEscolar from "/ViewerTrabalhoEscolar.js";

export default class CtrlManterTrabalhoEscolar {
  
  //-----------------------------------------------------------------------------------------//

  //
  // Atributos do Controlador
  //
  #dao;      // Referência para o Data Access Object para o Store de TrabalhosEscolares
  #viewer;   // Referência para o gerenciador do viewer 
  #posAtual; // Indica a posição do objeto TrabalhoEscolar que estiver sendo apresentado
  #status;   // Indica o que o controlador está fazendo 
  
  //-----------------------------------------------------------------------------------------//

  constructor() {
    this.#dao = new DaoTrabalhoEscolar();
    this.#viewer = new ViewerTrabalhoEscolar(this);
    this.#posAtual = 1;
    this.#atualizarContextoNavegacao();    
  }
  
  //-----------------------------------------------------------------------------------------//

  async #atualizarContextoNavegacao() {
    // Guardo a informação que o controlador está navegando pelos dados
    this.#status = Status.NAVEGANDO;

    // Determina ao viewer que ele está apresentando dos dados 
    this.#viewer.statusApresentacao();
    
    // Solicita ao DAO que dê a lista de todos os trabalhos presentes na base
    let conjTrabalhos = await this.#dao.obterTrabalhosEscolares();
    
    // Se a lista de trabalhos escolares estiver vazia
    if(conjTrabalhos.length == 0) {
      // Posição Atual igual a zero indica que não há objetos na base
      this.#posAtual = 0;
      
      // Informo ao viewer que não deve apresentar nada
      this.#viewer.apresentar(0, 0, null);
    }
    else {
      // Se é necessário ajustar a posição atual, determino que ela passa a ser 1
      if(this.#posAtual == 0 || this.#posAtual > conjTrabalhos.length)
        this.#posAtual = 1;
      // Peço ao viewer que apresente o objeto da posição atual
      this.#viewer.apresentar(this.#posAtual, conjTrabalhos.length, conjTrabalhos[this.#posAtual - 1]);
    }
  }
  
  
  //-----------------------------------------------------------------------------------------//

  async apresentarPrimeiro() {
    let conjTrabalhos = await this.#dao.obterTrabalhosEscolares();
    if(conjTrabalhos.length > 0)
      this.#posAtual = 1;
    this.#atualizarContextoNavegacao();
  }

  //-----------------------------------------------------------------------------------------//

  async apresentarProximo() {
    let conjTrabalhos = await this.#dao.obterTrabalhosEscolares();
    if(this.#posAtual < conjTrabalhos.length)
      this.#posAtual++;
    this.#atualizarContextoNavegacao();
  }

  //-----------------------------------------------------------------------------------------//

  async apresentarAnterior() {
    let conjTrabalhos = await this.#dao.obterTrabalhosEscolares();
    if(this.#posAtual > 1)
      this.#posAtual--;
    this.#atualizarContextoNavegacao();
  }

  //-----------------------------------------------------------------------------------------//

  async apresentarUltimo() {
    let conjTrabalhos = await this.#dao.obterTrabalhosEscolares();
    this.#posAtual = conjTrabalhos.length;
    this.#atualizarContextoNavegacao();
  }

  //-----------------------------------------------------------------------------------------//
  
  iniciarIncluir() {
    this.#status = Status.INCLUINDO;
    this.#viewer.statusEdicao(Status.INCLUINDO);
    // Guardo a informação que o método de efetivação da operação é o método incluir. 
    // Preciso disto, pois o viewer mandará a mensagem "efetivar" (polimórfica) ao invés de 
    // "incluir"
    this.efetivar = this.incluir;
  }

  //-----------------------------------------------------------------------------------------//
  
  iniciarAlterar() {
    this.#status = Status.ALTERANDO;
    this.#viewer.statusEdicao(Status.ALTERANDO);
    // Guardo a informação que o método de efetivação da operação é o método incluir. 
    // Preciso disto, pois o viewer mandará a mensagem "efetivar" (polimórfica) ao invés de 
    // "alterar"
    this.efetivar = this.alterar;
  }

  //-----------------------------------------------------------------------------------------//
  
  iniciarExcluir() {
    this.#status = Status.EXCLUINDO;
    this.#viewer.statusEdicao(Status.EXCLUINDO);
    // Guardo a informação que o método de efetivação da operação é o método incluir. 
    // Preciso disto, pois o viewer mandará a mensagem "efetivar" (polimórfica) ao invés de 
    // "excluir"
    this.efetivar = this.excluir;
  }

  //-----------------------------------------------------------------------------------------//
 
  async incluir(matriculaAluno, disciplina, tema, nota) {
    if(this.#status == Status.INCLUINDO) {
      try {
        let trabalho = new TrabalhoEscolar(matriculaAluno, disciplina, tema, nota);
        await this.#dao.incluir(trabalho); 
        this.#status = Status.NAVEGANDO;
        this.#atualizarContextoNavegacao();
      }
      catch(e) {
        alert(e);
      }
    }    
  }

  //-----------------------------------------------------------------------------------------//
 
  async alterar(matriculaAluno, disciplina, tema, nota) {
    if(this.#status == Status.ALTERANDO) {
      try {
        let trabalho = await this.#dao.obterTrabalhoEscolarPelaMatriculaAluno(matriculaAluno); 
        if(trabalho == null) {
          alert("Trabalho com a aluno de matrícula " + matriculaAluno + " não encontrado.");
        } else {
          trabalho.setDisciplina(disciplina);
          trabalho.setTema(tema);
          trabalho.setNota(nota);
          await this.#dao.alterar(trabalho); 
        }
        this.#status = Status.NAVEGANDO;
        this.#atualizarContextoNavegacao();
      }
      catch(e) {
        alert(e);
      }
    }    
  }

  //-----------------------------------------------------------------------------------------//
 
  async excluir(matriculaAluno) {
    if(this.#status == Status.EXCLUINDO) {
      try {
        let trabalho = await this.#dao.obterTrabalhoEscolarPelaMatriculaAluno(matriculaAluno); 
        if(trabalho == null) {
          alert("Trabalho com a aluno de matrícula " + matriculaAluno + " não encontrado.");
        } else {
          await this.#dao.excluir(trabalho); 
        }
        this.#status = Status.NAVEGANDO;
        this.#atualizarContextoNavegacao();
      }
      catch(e) {
        alert(e);
      }
    }    
  }

  //-----------------------------------------------------------------------------------------//

  cancelar() {
    this.#atualizarContextoNavegacao();
  }

  //-----------------------------------------------------------------------------------------//

  getStatus() {
    return this.#status;
  }

  //-----------------------------------------------------------------------------------------//
}

//------------------------------------------------------------------------//
