import ModelError from "/ModelError.js";

export default class TrabalhoEscolar {
    
  //
  // DECLARAÇÃO DE ATRIBUTOS PRIVADOS: Em JavaScript, se o nome do atributo tem # no início, isso 
  // indica que ele é privado. Também deve-se colocar a presença dele destacada, como está abaixo.
  //
  #matriculaAluno;
  #disciplina;
  #tema;
  #nota;

  //-----------------------------------------------------------------------------------------//

  constructor(matriculaAluno, disciplina, tema, nota) {
    this.setMatriculaAluno(matriculaAluno);
    this.setDisciplina(disciplina);
    this.setTema(tema);
    this.setNota(nota); 
  }
  
  //-----------------------------------------------------------------------------------------//

  getMatriculaAluno() {
    return this.#matriculaAluno;
  }
  
  //-----------------------------------------------------------------------------------------//

  setMatriculaAluno(matriculaAluno) {
    if(!TrabalhoEscolar.validarMatriculaAluno(matriculaAluno))
      throw new ModelError("Matrícula Inválida: " + matriculaAluno);
    this.#matriculaAluno = matriculaAluno;
  }
  
  //-----------------------------------------------------------------------------------------//

  getDisciplina() {
    return this.#disciplina;
  }
  
  //-----------------------------------------------------------------------------------------//

  setDisciplina(disciplina) {
    if(!TrabalhoEscolar.validarDisciplina(disciplina))
      throw new ModelError("Disciplina Inválida: " + disciplina);
    this.#disciplina = disciplina;
  }
  
  //-----------------------------------------------------------------------------------------//

  getTema() {
    return this.#tema;
  }
  
  //-----------------------------------------------------------------------------------------//

  setTema(tema) {
    if(!TrabalhoEscolar.validarTema(tema))
      throw new ModelError("Tema Inválido: " + tema);
    this.#tema = tema;
  }

  //-----------------------------------------------------------------------------------------//
  getNota() {
    return this.#nota;
  }
  
  //-----------------------------------------------------------------------------------------//

  setNota(nota) {
    if(!TrabalhoEscolar.validarNota(nota))
      throw new ModelError("Nota Inválida: " + nota);
    this.#nota = nota;
  }

  //-----------------------------------------------------------------------------------------//

  toJSON() {
    return '{' +
               '"matriculaAluno" : "'+ this.#matriculaAluno + '",' +
               '"disciplina" :  "' + this.#disciplina + '",' +
               '"tema" : "' + this.#tema + '",' +
               '"nota" : "' + this.#nota + '" ' + 
           '}';  
  }
  
  //-----------------------------------------------------------------------------------------//

  static assign(obj) {
    return new TrabalhoEscolar(obj.matriculaAluno, obj.disciplina, obj.tema, obj.nota);
  }

  //-----------------------------------------------------------------------------------------//
  
  static deassign(obj) { 
    return JSON.parse(obj.toJSON());
  }

  //-----------------------------------------------------------------------------------------//

  static validarMatriculaAluno(matriculaAluno) {
    if(matriculaAluno == null || matriculaAluno == "" || matriculaAluno == undefined)
      return false;
    if (matriculaAluno.length > 10) 
      return false;
    const padraomatriculaAluno = /[0-9] */;
    if (!padraomatriculaAluno.test(matriculaAluno)) 
      return false;
    return true;
  }

    //-----------------------------------------------------------------------------------------//

    static validarDisciplina(disciplina) {
        if(disciplina == null || disciplina == "" || disciplina == undefined)
          return false;
        if (disciplina.length > 40) 
          return false;
        const padraodisciplina = /[A-Z][a-z] */;
        if (!padraodisciplina.test(disciplina)) 
          return false;
        return true;
      }
  
    static validarTema(tema) {
        if(tema == null || tema == "" || tema == undefined)
          return false;
        if (tema.length > 40) 
          return false;
        const padraoTema = /[A-Z][a-z] */;
        if (!padraoTema.test(tema)) 
          return false;
        return true;
      }
  
    static validarNota(nota) {
        if (nota.length >= 0) 
          return true;
        return false;
    }

  //-----------------------------------------------------------------------------------------//
   
  mostrar() {
    let texto = "Matrícula aluno: " + this.matriculaAluno + "\n";
    texto += "Disciplina: " + this.disciplina + "\n";
    texto += "Tema: " + this.tema + "\n";
    texto += "Nota: " + this.nota + "\n";
      
    alert(texto);
    alert(JSON.stringify(this));
  }
}