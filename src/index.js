import Color from "color";

const fileInput = document.querySelector("input[type='file']");
const loadedBlock = document.querySelector("#loaded");
const colorsBlock = document.querySelector("#colors");
const variantsBlock = document.querySelector("#variants");

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();

    reader.onload = (progressE) => {
        const { result } = progressE.target;
        loadedBlock.innerHTML = result;

        const colors = getSvgColors(loadedBlock.querySelector("svg"));
        const colorsHtml = colors.reduce((html, color) => {
            return (
                html +
                `
                <div class="color-item">
                    <span class="color-item__color"
                        style="background-color: ${color}"></span>
                    <span class="color-item__name">${color}</span>
                </div>
            `
            );
        }, "");
        colorsBlock.innerHTML = colorsHtml;

        let variants = [];
        variants = variants.concat(
            getColorMutations(colors, {
                count: 12, // full hue circle
            })
        );
        variants = variants.concat(
            getColorMutations(colors, { count: 5, randomMode: true })
        );
        variants = variants.concat(
            getColorMutations(colors, { count: 10, psychoMode: true })
        );
        const variantsHtml = variants
            .map((newColors) => replace(result, colors, newColors))
            .join("");
        variantsBlock.innerHTML = variantsHtml;
    };

    reader.readAsText(file);
});

function getSvgColors(svg) {
    const isColor = (value) => {
        return (
            !!value && typeof value == "string" && value.toLowerCase() != "none"
        );
    };
    const collect = (node) => {
        const currentColors = [];

        try {
            if (isColor(node.attributes.fill.value))
                currentColors.push(node.attributes.fill.value);
        } catch (e) {}
        try {
            if (isColor(node.attributes.stroke.value))
                currentColors.push(node.attributes.stroke.value);
        } catch (e) {}
        // also check styles

        if (node.children.length == 0) return currentColors;

        return currentColors.concat(
            [...node.children].flatMap((child) => getSvgColors(child))
        );
    };

    const colors = collect(svg);
    const uniqueColors = new Set(colors);
    return [...uniqueColors];
}

function getColorMutations(
    colors,
    { count = 10, randomMode = false, psychoMode = false }
) {
    const mutations = [];
    for (let i = 0; i < count; i++) {
        mutations.push(
            colors.map((c) => {
                if (psychoMode) {
                    const a = Math.random(),
                        b = Math.random();
                    if (a > 0.7)
                        return Color(c)
                            .rotate(180 * b)
                            .rgb()
                            .string();
                    if (b > 0.7)
                        return Color(c)
                            .rotate(-180 * a)
                            .rgb()
                            .string();
                    if (a > 0.6 && b > 0.6)
                        return Color(c)
                            .mix(
                                Color.cmyk(
                                    100 * a,
                                    100 * b,
                                    100 * a * b,
                                    50 * a * b
                                )
                            )
                            .rgb()
                            .string();
                    return Color.hsl(
                        randomInteger(0, 359),
                        randomInteger(30, 100),
                        randomInteger(40, 100)
                    )
                        .rgb()
                        .string();
                }
                const Rnd = randomMode ? Math.random() * 14 - 7 : 0;
                return Color(c)
                    .rotate((30 + Rnd) * (i + 1))
                    .rgb()
                    .string();
            })
        );
    }
    return mutations;
}

function replace(str, a, b) {
    let newStr = str;
    for (let i in a) {
        newStr = newStr.replaceAll(a[i], b[i]);
    }
    return newStr;
}

function randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}
