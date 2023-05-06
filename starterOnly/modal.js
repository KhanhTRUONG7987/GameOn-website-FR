function editNav() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

// DOM Elements
const modalbg = document.querySelector(".bground");
const modalBtn = document.querySelectorAll(".modal-btn");
const formData = document.querySelectorAll(".formData");
const successMessage = document.querySelector(".content .success_text");
const buttonCLose = document.querySelector(".content .btn-close");
const formElement = document.getElementById("formModal");

// launch modal event
modalBtn.forEach((btn) => btn.addEventListener("click", launchModal));

// launch modal form

function launchModal() {
  modalbg.style.display = "block";
}

// ISSUE #1: fermer la modale (ajouter la fonctionnalité au bouton x)
function hideModal() {
  modalbg.style.display = "none";

  formElement.classList.remove("hidden");

  const deletesuccessMessage = document.querySelector(".success_text");
  if (deletesuccessMessage) {
    deletesuccessMessage.remove();
  }

  const btnClose = document.querySelector(".btn-close");
  if (btnClose) {
    btnClose.remove();
  }

  // delete all error messages
  const allErrors = document.querySelectorAll(".form-message");
  allErrors.forEach((singleError) => (singleError.innerText = ""));

  // remove all `invalid` class after close form
  const allClassesInvalid = document.querySelectorAll(".invalid");
  allClassesInvalid.forEach((singleClassInvalid) =>
    singleClassInvalid.classList.remove("invalid")
  );

  // reset form with default values with reset()
  const resetForm = document.getElementById("formModal");
  resetForm.reset();

  history.go(0);
}

const spanClose = document.querySelector(".close");
spanClose.addEventListener("click", (e) => {
  let target = e.target;
  if (target === spanClose) {
    hideModal();
  }
});

const btnClose = document.querySelector(".btn-close");
btnClose.addEventListener("click", (e) => {
  let target = e.target;
  if (target === btnClose) {
    hideModal();
    //let resetForm = document.getElementById("formModal");
  }
});

// ISSUE #2: Implémenter entrées du formulaire ()

function Validator(formSelector) {
  let _this = this;

  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  // ISSUE #3: Ajouter validation ou messages d'erreur
  const validatorRules = {
    firstRequired: function (value) {
      // const intermediate = value === undefined;
      // console.log('intermediate :>> ', intermediate);
      return value ? undefined : `Veuillez entrer un prénom`;
    },
    lastRequired: function (value) {
      return value ? undefined : `Veuillez entrer un nom`;
    },
    emailRequired: function (value) {
      return value ? undefined : `Veuillez entrer une adresse email`;
    },
    email: function (value) {
      let regex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      return regex.test(value) ? undefined : `Veuillez entrer une adresse email!`;
    },
    // eg: min: 2 => need to push 2 into the value? => nested function
    min: function (min) {
      return function (value) {
        return value.length >= min
          ? undefined
          : `Veuillez entrer au moins ${min} caractères`;
      };
    },
    /** max: function (max) {
      //eg: min: 2 => need to push 2 into the value? => nested function 
      return function (value) {
        return value.length <= max ? undefined : "Veuillez entrer au maximum ${max} caractères";
      }
    }, */
    numberRequired: function (value) {
      return value ? undefined : `Veuillez indiquer une valeur`;
    },
    integerNumber: function (value) {
      let regex = /^(\d?[1-9]|[1-9]0)$/;
      return regex.test(value)
        ? undefined
        : `Veuillez indiquer un nombre entier entre 0 et 99`;
    },
  
    birthdayRequired: function (value) {
      return value ? undefined : `Veuillez indiquer une date de naissance`;
    },
  
    birthday: function (value) {
      value = new Date(value);
      let currentDate = new Date();
      return value < currentDate
        ? undefined
        : `Veuillez indiquer une date de naissance valide`;
    },
  
    checkedRequired: function (value = false) {
      let checkedBox = document.querySelector(`input[name="cgu"]:checked`);
      value == checkedBox;
      return value
        ? undefined
        : `Vous devez verifier que vous acceptez les termes et conditions`;
    },
  
    checkedOptional: function (value = false) {
      let checkedBox = document.querySelector(`input[name="membership"]:checked`);
      value == checkedBox;
      return value ? undefined : "";
      //Utilisateur ne veux pas être membre
    },
  
    radio: function (value) {
      //? Avec nullish coalescing operator ?? ou Optional chanining ?
      let checkedRadio = document.querySelector(
        'input[name="location"]:checked'
      )?.value;
  
      console.log("checkedRadio :>> ", checkedRadio);
      value === checkedRadio;
  
      console.log("value :>> ", value);
  
      return value ? undefined : `Veuillez selectionner une ville`;
    },
  };

  // ########################################################################################################################

  const formRules = {};

  const formElement = document.querySelector(formSelector);
  if (formElement) {
    let inputs = formElement.querySelectorAll("[name][data-rules]");
    for (let input of inputs) {
      let rules = input.getAttribute("data-rules").split("|");
      for (let rule of rules) {
        let ruleArray;
        let isRuleHasValue = rule.includes(":");

        // check min: 2 with `includes`or `indexOf`:
        if (isRuleHasValue) {
          ruleArray = rule.split(":");
          rule = ruleArray[0]; // to get only min
        }
        // get into the last function of the nested function? => eg: min: 2
        let ruleFunc = validatorRules[rule];
        if (isRuleHasValue) {
          ruleFunc = ruleFunc(ruleArray[1]);
        }
        if (Array.isArray(formRules[input.name])) {
          // since 2nd run of for => push rules into the array
          formRules[input.name].push(ruleFunc);
        } else {
          formRules[input.name] = [ruleFunc];
        }
      }

      input.onblur = handleValidate;
      input.onchange = handleValidate;
      input.oninput = handleClearErrors;
    }

    function handleValidate(event) {
      // : each rule above reveives value!
      let rules = formRules[event.target.name];
      console.log("rules :>> ", rules);
      let errorMessage;

      for (let rule of rules) {
        if (event.target.type === "checkbox" || event.target.type === "radio") {
          errorMessage = rule(event.target.checked);
        } else {
          errorMessage = rule(event.target.value);
        }
        if (errorMessage) break;
      }

      // if err => return err messages => UI
      if (errorMessage) {
        // input => formData => to get form-message out:
        let formData = getParent(event.target, ".formData");
        if (formData) {
          // (!!.3) add class `invalid` => UI errors => CSS ;)
          formData.classList.add("invalid");
          let formMessage = formData.querySelector(".form-message");
          if (formMessage) {
            formMessage.innerText = errorMessage;
          }
        }
      }
      return !errorMessage;
    }
    function handleClearErrors(event) {
      // get formData firstly => to check if formData has class `invalid` => clear if true
      let formData = getParent(event.target, ".formData");
      if (formData.classList.contains("invalid")) {
        formData.classList.remove("invalid");

        // then reset form-message => set === '
        let formMessage = formData.querySelector(".form-message");
        if (formMessage) {
          formMessage.innerText = "";
        }
      }
    }
  }

  // ISSUE #4: Ajouter confirmation quand envoi réussi

  //(3): handle submit event:
  formElement.onsubmit = function (event) {
    event.preventDefault();
    let inputs = formElement.querySelectorAll("[name][data-rules]");
    let isValid = false;
    
    const inputFirstname = document.querySelector("input[name='first']").value;
    const inputLastname = document.querySelector("input[name='last']").value;
    const inputBirthdate = document.querySelector(
      "input[name='birthdate']"
    ).value;
    const inputQuantity = document.querySelector(
      "input[name='quantity']"
    ).value;
    const inputEmail = document.querySelector("input[name='email']").value;

    for (let input of inputs) {
      const radioButtonSelectedLocation = document.querySelector(
        "input[name='location']:checked"
      );
      const checkedCheckbox = input.type === "checkbox" && input.checked;
      if (
        radioButtonSelectedLocation &&
        checkedCheckbox &&
        inputBirthdate &&
        inputQuantity &&
        inputEmail &&
        inputFirstname &&
        inputLastname
      ) {
        if (handleValidate({ target: input })) {
          isValid = true;
        }
      }

      if (isValid) {
        let enableInputs = formElement.querySelectorAll("[name]");
        //?  0. expectation: if we use onSubmit => the function onSubmit added in index.js will return: inputs (selectors.target)- [name] of the inputs : value of the inputs
        let formValues = Array.from(enableInputs).reduce(function (
          values,
          input
        ) {
          switch (input.type) {
            case "radio":
              if (
                input.matches(":checked") &&
                !input.name === "location" &&
                inputs.type === "radio"
              ) {
                return validatorRules;
              } else {
                values[input.name] = document.querySelector(
                  `input[name="location"]:checked`
                ).value;
              }
              break;

            case "checkbox":
              if (!input.matches(":checked") && !input.name === "membership") {
                if (input.matches(":checked") && input.name === "membership") {
                  values[input.name] = "";
                }
                return validatorRules;
              }
              if (input.matches(":checked") && input.name === "cgu") {
                values[input.name] = document.querySelector(
                  `input[name="cgu"]:checked`
                ).value;
              }
              if (input.matches(":checked") && input.name === "membership") {
                values[input.name] = document.querySelector(
                  `input[name="membership"]:checked`
                ).value;
              }
              break;

            default:
              values[input.name] = input.value;
              console.log("values[input.name] :>> ", values[input.name]);
          }

          return values;
        },
        {});

        if (formValues.cgu) {
          _this.onSubmit(formValues);
          //visibility form content hidden
          formElement.classList.add("hidden");
          setTimeout(buttonCLose.classList.add("show"), 1000);
          setTimeout(successMessage.classList.add("show"), 1000);
        }
      } else {
        validatorRules.firstRequired();
        validatorRules.lastRequired();
        validatorRules.emailRequired();
        // validatorRules.email();
        // validatorRules.min();
        validatorRules.numberRequired();
        // validatorRules.integerNumber();
        validatorRules.birthdayRequired();
        // validatorRules.birthday();
        validatorRules.checkedRequired();
        // validatorRules.checkedOptional();
        // validatorRules.radioRequired();
        validatorRules.radio();
        // I want to map on each  function stored in validatorRules and execute them, but its an object

        // const validatorRulesArray = Object.entries(validatorRules);
        // validatorRulesArray.forEach( validator => {
        //     console.log('je passe ici');
        //   const unicValidatorFunction = validator[1];
        //   unicValidatorFunction();

        // });
      }
    }
  };
}
