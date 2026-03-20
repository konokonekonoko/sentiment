export default function registerSettings() {
    game.settings.register("sentiment", "swing-glow-enabled", {
        name: "Display Swing Glow",
        hint:
            "This setting determines whether an outline glow matching the current swing's color is shown around tokens. " +
            "(You will have to change Swing once for this setting to take effect.)",
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
    });

    game.settings.register("sentiment", "swing-glow-intensity", {
        name: "Swing Glow Intensity",
        hint: "How intense the Swing Glow is. (You will have to change Swing once for this setting to take effect.)",
        scope: "client",
        config: true,
        type: Number,
        default: 1.2,
        range: {
            min: 0.1,
            max: 3.0,
            step: 0.1
        },
    });
}