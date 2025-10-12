import $ from "jquery";

export function setupLegendToggle(){
    $(document).ready(function () {
        $('.legend-body').hide();
        $('.legend-header').on('click', function () {
            const $body = $(this).next('.legend-body');
            const isVisible = $body.is(':visible');

            // 開閉処理
            $body.slideToggle();

            // ヘッダーの▼/▲を切り替え
            const headerText = $(this).text();
            const updatedText = headerText.replace(isVisible ? '▲' : '▼', isVisible ? '▼' : '▲');
            $(this).text(updatedText);
        });
    });
}
