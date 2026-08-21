const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];


// ===============================
// HISTORY
// ===============================

const historyKey = "smartCalculatorHistory";

let history =
    JSON.parse(
        localStorage.getItem(historyKey) || "[]"
    );


function formatNumber(number) {

    return Number(number).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2
        }
    );

}


function escapeHTML(text) {

    return String(text).replace(
        /[&<>"']/g,
        function(character) {

            const characters = {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            };

            return characters[character];

        }
    );

}


function saveHistory(type, detail, result) {

    history.unshift({

        type: type,

        detail: detail,

        result: result,

        time:
            new Date().toLocaleString(
                "en-IN",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            )

    });


    history = history.slice(0, 50);


    localStorage.setItem(
        historyKey,
        JSON.stringify(history)
    );


    renderHistory();

    updateDashboard();

}


// ===============================
// RENDER HISTORY
// ===============================

function renderHistory() {

    const historyBox =
        $("#historyList");


    if (!historyBox) return;


    if (history.length === 0) {

        historyBox.innerHTML = `
            <div class="empty">
                No calculations yet.
            </div>
        `;

        return;

    }


    historyBox.innerHTML =
        history.map((item, index) => `

            <div class="history-item">

                <button
                    class="delete-history"
                    data-delete="${index}">

                    ×

                </button>


                <div class="type">

                    ${escapeHTML(item.type)}

                </div>


                <div>

                    ${escapeHTML(item.detail)}

                </div>


                <strong>

                    ${escapeHTML(item.result)}

                </strong>


                <div class="time">

                    ${escapeHTML(item.time)}

                </div>

            </div>

        `).join("");

}


// ===============================
// DELETE SINGLE HISTORY
// ===============================

$("#historyList").addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "[data-delete]"
            );


        if (!button) return;


        const index =
            Number(
                button.dataset.delete
            );


        history.splice(
            index,
            1
        );


        localStorage.setItem(
            historyKey,
            JSON.stringify(history)
        );


        renderHistory();

        updateDashboard();

    }
);


// ===============================
// CLEAR HISTORY
// ===============================

$("#clearHistory").addEventListener(
    "click",
    function() {

        if (
            history.length === 0
        ) {

            alert(
                "History is already empty."
            );

            return;

        }


        const confirmation =
            confirm(
                "Clear all calculation history?"
            );


        if (confirmation) {

            history = [];


            localStorage.removeItem(
                historyKey
            );


            renderHistory();

            updateDashboard();

        }

    }
);


// ===============================
// TAB SYSTEM
// ===============================

function showTab(tabName) {

    $$("[data-tab]").forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.tab === tabName
            );

        }
    );


    $$(".panel").forEach(
        panel => {

            panel.classList.toggle(
                "active",
                panel.id === tabName
            );

        }
    );

}


// Sidebar and top tabs
$$("[data-tab]").forEach(
    button => {

        button.addEventListener(
            "click",
            function() {

                showTab(
                    button.dataset.tab
                );

            }
        );

    }
);


// Dashboard feature buttons
$$("[data-open]").forEach(
    button => {

        button.addEventListener(
            "click",
            function() {

                showTab(
                    button.dataset.open
                );

            }
        );

    }
);


// ===============================
// DASHBOARD
// ===============================

function updateDashboard() {

    $("#dashHistory").textContent =
        history.length;


    $("#dashLast").textContent =
        history[0]
            ? history[0].type
            : "None";


    $("#dashTheme").textContent =
        document.body.classList.contains("dark")
            ? "Dark"
            : "Light";

}


// ===============================
// PERCENTAGE CALCULATOR
// ===============================

$("#percentageForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const percentage =
            Number(
                $("#percentValue").value
            );


        const number =
            Number(
                $("#percentBase").value
            );


        const result =
            (percentage * number) / 100;


        const text =
            `${formatNumber(percentage)}% of ${formatNumber(number)} = ${formatNumber(result)}`;


        $("#percentageResult").textContent =
            text;


        saveHistory(
            "Percentage",
            `${formatNumber(percentage)}% of ${formatNumber(number)}`,
            formatNumber(result)
        );

    }
);


// ===============================
// PERCENTAGE CHANGE
// ===============================

$("#changeForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const oldValue =
            Number(
                $("#oldValue").value
            );


        const newValue =
            Number(
                $("#newValue").value
            );


        if (oldValue === 0) {

            $("#changeResult").textContent =
                "Old value cannot be 0.";

            return;

        }


        const change =
            (
                (newValue - oldValue)
                /
                Math.abs(oldValue)
            ) * 100;


        let text;


        if (change > 0) {

            text =
                `Increase: ${Math.abs(change).toFixed(2)}%`;

        }
        else if (change < 0) {

            text =
                `Decrease: ${Math.abs(change).toFixed(2)}%`;

        }
        else {

            text =
                "No change";

        }


        $("#changeResult").textContent =
            text;


        saveHistory(
            "% Change",
            `${formatNumber(oldValue)} → ${formatNumber(newValue)}`,
            text
        );

    }
);


// ===============================
// AMOUNT CALCULATOR
// ===============================

$("#amountForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const amount =
            Number(
                $("#amountValue").value
            );


        const discount =
            Math.max(
                0,
                Number(
                    $("#discount").value
                ) || 0
            );


        const gst =
            Math.max(
                0,
                Number(
                    $("#gst").value
                ) || 0
            );


        const discountAmount =
            amount * discount / 100;


        const afterDiscount =
            amount - discountAmount;


        const gstAmount =
            afterDiscount * gst / 100;


        const finalAmount =
            afterDiscount + gstAmount;


        $("#amountResult").innerHTML = `

            <div>

                <span>
                    Discount
                </span>

                <strong>
                    ₹${formatNumber(discountAmount)}
                </strong>

            </div>


            <div>

                <span>
                    After Discount
                </span>

                <strong>
                    ₹${formatNumber(afterDiscount)}
                </strong>

            </div>


            <div>

                <span>
                    GST
                </span>

                <strong>
                    ₹${formatNumber(gstAmount)}
                </strong>

            </div>


            <div class="total">

                <span>
                    Final Amount
                </span>

                <strong>
                    ₹${formatNumber(finalAmount)}
                </strong>

            </div>

        `;


        saveHistory(
            "Amount",
            `₹${formatNumber(amount)} | Discount ${discount}% | GST ${gst}%`,
            `Final: ₹${formatNumber(finalAmount)}`
        );

    }
);


// ===============================
// 10TH MARKS CALCULATOR
// ===============================

$("#marksForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const marks =
            $$(".mark").map(
                input =>
                    Number(input.value)
            );


        if (
            marks.some(
                mark =>
                    mark < 0 ||
                    mark > 100 ||
                    Number.isNaN(mark)
            )
        ) {

            alert(
                "Please enter marks between 0 and 100."
            );

            return;

        }


        const total =
            marks.reduce(
                (sum, mark) =>
                    sum + mark,
                0
            );


        const percentage =
            total / 6;


        $("#marksTotal").textContent =
            formatNumber(total);


        $("#marksAverage").textContent =
            percentage.toFixed(2);


        $("#marksPercent").textContent =
            percentage.toFixed(2) + "%";


        $("#marksBar").style.width =
            Math.min(
                percentage,
                100
            ) + "%";


        let message;


        if (percentage >= 75) {

            message =
                "Excellent result! 🎉";

        }
        else if (percentage >= 60) {

            message =
                "Very good result! 👍";

        }
        else if (percentage >= 45) {

            message =
                "Good, keep improving! 📚";

        }
        else {

            message =
                "Keep practicing! 💪";

        }


        $("#marksMessage").textContent =
            message;


        saveHistory(
            "10th Marks",
            `${formatNumber(total)}/600`,
            `Percentage: ${percentage.toFixed(2)}%`
        );

    }
);


// ===============================
// CGPA / SGPA
// ===============================

function addSubject(
    gradePoint = "",
    credits = ""
) {

    const row =
        document.createElement("div");


    row.className =
        "cgpa-row";


    row.innerHTML = `

        <label>

            Grade Point

            <input
                class="gp"
                type="number"
                min="0"
                max="10"
                step="0.01"
                value="${gradePoint}"
                placeholder="8.5">

        </label>


        <label>

            Credits

            <input
                class="cr"
                type="number"
                min="0"
                step="0.5"
                value="${credits}"
                placeholder="4">

        </label>


        <button
            type="button"
            class="remove">

            Remove

        </button>

    `;


    $("#cgpaRows").appendChild(
        row
    );

}


// Add subject button
$("#addSubject").addEventListener(
    "click",
    function() {

        addSubject();

    }
);


// Remove subject
$("#cgpaRows").addEventListener(
    "click",
    function(event) {

        if (
            event.target.classList.contains(
                "remove"
            )
        ) {

            event.target
                .closest(".cgpa-row")
                .remove();

        }

    }
);


// Default subjects
addSubject();
addSubject();
addSubject();


// Calculate CGPA
$("#calcCgpa").addEventListener(
    "click",
    function() {

        const rows =
            $$(".cgpa-row");


        let totalPoints = 0;

        let totalCredits = 0;


        rows.forEach(
            row => {

                const gradePoint =
                    Number(
                        $(".gp", row).value
                    );


                const credits =
                    Number(
                        $(".cr", row).value
                    );


                if (
                    gradePoint >= 0 &&
                    gradePoint <= 10 &&
                    credits > 0
                ) {

                    totalPoints +=
                        gradePoint * credits;


                    totalCredits +=
                        credits;

                }

            }
        );


        if (totalCredits === 0) {

            $("#cgpaResult").textContent =
                "Enter valid grade points and credits.";

            return;

        }


        const cgpa =
            totalPoints /
            totalCredits;


        const resultText =
            `CGPA / SGPA = ${cgpa.toFixed(2)}`;


        $("#cgpaResult").textContent =
            resultText;


        saveHistory(
            "CGPA / SGPA",
            `${totalCredits} total credits`,
            `CGPA: ${cgpa.toFixed(2)}`
        );

    }
);


// ===============================
// EMI CALCULATOR
// ===============================

$("#emiForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const principal =
            Number(
                $("#loanAmount").value
            );


        const annualInterest =
            Number(
                $("#interest").value
            );


        const years =
            Number(
                $("#tenure").value
            );


        const monthlyRate =
            annualInterest / 1200;


        const months =
            years * 12;


        let emi;


        if (monthlyRate === 0) {

            emi =
                principal / months;

        }
        else {

            emi =
                principal *
                monthlyRate *
                Math.pow(
                    1 + monthlyRate,
                    months
                )
                /
                (
                    Math.pow(
                        1 + monthlyRate,
                        months
                    ) - 1
                );

        }


        const totalPayment =
            emi * months;


        const totalInterest =
            totalPayment - principal;


        $("#emiResult").innerHTML = `

            <div>

                <span>
                    Monthly EMI
                </span>

                <strong>
                    ₹${formatNumber(emi)}
                </strong>

            </div>


            <div>

                <span>
                    Total Interest
                </span>

                <strong>
                    ₹${formatNumber(totalInterest)}
                </strong>

            </div>


            <div class="total">

                <span>
                    Total Payment
                </span>

                <strong>
                    ₹${formatNumber(totalPayment)}
                </strong>

            </div>

        `;


        saveHistory(
            "EMI",
            `₹${formatNumber(principal)} | ${annualInterest}% | ${years} years`,
            `EMI: ₹${formatNumber(emi)}`
        );

    }
);


// ===============================
// SCIENTIFIC CALCULATOR
// ===============================

let scientificExpression = "";


function updateScientificDisplay() {

    $("#sciExpression").textContent =
        scientificExpression || "0";

}


function calculateScientific() {

    try {

        let expression =
            scientificExpression;


        expression =
            expression
                .replaceAll(
                    "sqrt",
                    "Math.sqrt"
                )
                .replaceAll(
                    "sin",
                    "Math.sin"
                )
                .replaceAll(
                    "cos",
                    "Math.cos"
                )
                .replaceAll(
                    "^",
                    "**"
                );


        if (!expression) {

            return;

        }


        const result =
            Function(
                '"use strict"; return (' +
                expression +
                ')'
            )();


        if (
            !Number.isFinite(result)
        ) {

            throw new Error();

        }


        $("#sciResult").textContent =
            formatNumber(result);


        saveHistory(
            "Scientific",
            scientificExpression,
            formatNumber(result)
        );

    }
    catch (error) {

        $("#sciResult").textContent =
            "Error";

    }

}


// Scientific buttons
$$(".key").forEach(
    button => {

        button.addEventListener(
            "click",
            function() {

                const value =
                    button.dataset.value;


                const action =
                    button.dataset.action;


                if (action === "clear") {

                    scientificExpression = "";


                    $("#sciResult").textContent =
                        "0";


                    updateScientificDisplay();

                    return;

                }


                if (action === "back") {

                    scientificExpression =
                        scientificExpression.slice(
                            0,
                            -1
                        );


                    updateScientificDisplay();

                    return;

                }


                if (action === "equals") {

                    calculateScientific();

                    return;

                }


                if (value) {

                    scientificExpression +=
                        value;


                    updateScientificDisplay();

                }

            }
        );

    }
);


// Keyboard support
document.addEventListener(
    "keydown",
    function(event) {

        if (
            !$("#scientific").classList.contains(
                "active"
            )
        ) {

            return;

        }


        if (
            /[0-9.+\-*/()]/.test(
                event.key
            )
        ) {

            scientificExpression +=
                event.key;


            updateScientificDisplay();

        }
        else if (
            event.key === "Enter"
        ) {

            calculateScientific();

        }
        else if (
            event.key === "Backspace"
        ) {

            scientificExpression =
                scientificExpression.slice(
                    0,
                    -1
                );


            updateScientificDisplay();

        }

    }
);


// ===============================
// DARK / LIGHT MODE
// ===============================

$("#themeBtn").addEventListener(
    "click",
    function() {

        document.body.classList.toggle(
            "dark"
        );


        const isDark =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            "smartTheme",
            isDark
                ? "dark"
                : "light"
        );


        $("#themeBtn").textContent =
            isDark
                ? "☀"
                : "☾";


        updateDashboard();

    }
);


// Load saved theme
if (
    localStorage.getItem(
        "smartTheme"
    ) === "dark"
) {

    document.body.classList.add(
        "dark"
    );


    $("#themeBtn").textContent =
        "☀";

}


// ===============================
// INITIALIZE
// ===============================

renderHistory();

updateDashboard();

showTab("dashboard");