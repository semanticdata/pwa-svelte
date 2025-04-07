<script>
    !(function (d, s, id) {
        var js,
            fjs = d.getElementsByTagName(s)[0];
        if (!d.getElementById(id)) {
            js = d.createElement(s);
            js.id = id;
            js.src = "https://weatherwidget.io/js/widget.min.js";
            fjs.parentNode.insertBefore(js, fjs);
        }
    })(document, "script", "weatherwidget-io-js");
</script>

<div>
    <a
        class="weatherwidget-io"
        href="https://forecast7.com/en/45d03n93d36/crystal/?unit=us"
        data-label_1="Crystal, MN"
        data-label_2="Weather"
        data-theme="original"
        data-basecolor="#1e2939">CRYSTAL, MN WEATHER</a
    >
</div>

<style>
    .weatherwidget-io {
        max-width: 699px;
        margin: 0 auto;
    }
</style>
