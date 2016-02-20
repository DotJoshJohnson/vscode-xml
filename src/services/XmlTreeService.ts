'use strict';

let DOMParser = require('xmldom').DOMParser;

export class XmlTreeService {
    static getXmlTreeHtml(xml: string): string {
        let xdoc: Document = new DOMParser().parseFromString(xml, 'text/xml');
        let html: string =
        `
        <!DOCTYPE html>
        <html>
        <head>
            <title>XML Tree View</title>
            <style>
                *, html {
                    font-family: Verdana, Arial, Helvetica, sans-serif;
                }

                body, form, ul, li, p, h1, h2, h3, h4, h5 {
                    margin: 0;
                    padding: 0;
                }

                body {
                    color: #ffffff;
                    margin: 0;
                }

                img {
                    border: none;
                }

                p {
                    font-size: 1em;
                    margin: 0 0 1em 0;
                }

                html {
                    font-size: 100%;
                    /* IE hack */
                }

                body {
                    font-size: 1em;
                    /* Sets base font size to 16px */
                }

                table {
                    font-size: 100%;
                    /* IE hack */
                }

                input, select, textarea, th, td {
                    font-size: 1em;
                }


                /* CSS Tree menu styles */

                ol.tree {
                    padding: 0 0 0 30px;
                    width: 300px;
                }

                li {
                    position: relative;
                    margin-left: -15px;
                    list-style: none;
                }

                li.xml {
                    margin-left: -1px !important;
                }

                li.xml a {
                    background: url(document.png) 0 0 no-repeat;
                    color: #000;
                    padding-left: 21px;
                    text-decoration: none;
                    display: block;
                }

                li.xml-attribute a {
                    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAj1JREFUOBGtU01oE0EUfm92V5s0K9G2UsXWJI1BlKoXT4J4URAvItKDYA9K0aQUpOhNb3oR/6AmS7wIHj15UfAg1oM3g5fm0EObVhSxVJJm05QmmXm+2brbxuBJH8zO936+b2bezAL8o+Hf+PseUcgI1Q8aCHsUyvkesOcK17D5Z32HwN48hbfL2n0uHAOCMiB8ZzzAw+Jxu5Sxp3gOrE3gcHYpsoqhtxwMoxBj89e7P/mViax7gRCesejj0rh9z4+3CSRyrqMATiuQx79kouWh7EpSonHCQCrMpe2ZmOOeQoJ3Ssrk4kS0pEWEr5TKV3sJ4Aoh3dLkeM6dUChmEWhSERTijntnIW1Pc/1nQ5jnfV4g0JDiHAA2Iz3268TTaooLnvCWM3zmo4x/ElHDIxF85GWPdAggqWEOFosj2CCBI4ybrbXICyCWAejjlZY8EtI6KQp7mD+mDwBFlEgtez7BMHd/8eskrqW6q71NQBOE8WOjFmOI8M3nBUcgVFVE3OElECo898eeU1dD4kUdI0mtwVxlJ0NuMrzSMW3BLcSztVFAyqPR7FfSOsaJ95wvM9UlwBr7NvsWH2iam3lJk7UFO7BM9YZ9VMq6sZCxP0iQSQQ1um7Yh1rb1EnO3QSBZ7eStUCwA+0kHDdNBFMI+CBE9bvF8d01HR/K1gfMrtXK7NU+V/tbrU1AJ+JO7TJ3/iHDXTx04/QTjvLWz/x+B+xuWoeAl3pJxuDyyn6B5gEDSP9AM/wSN65xk/t/0C/vHM3QxJasvQAAAABJRU5ErkJggg==) 0 0 no-repeat;
                }

                li.xml-text a {
                    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAElJREFUOBFjYBhowIjsgDnqG1YB+aHIYphsxrCUm/6rYeJMMAa5NIoLkA2Zo74R6JL/IBcxpNwMwKmOYheMGsDAMBoGyElvoNgA5p8KF92MLqAAAAAASUVORK5CYII=) 0 0 no-repeat;
                }

                li input {
                    position: absolute;
                    left: 0;
                    margin-left: 0;
                    opacity: 0;
                    z-index: 2;
                    cursor: pointer;
                    height: 1em;
                    width: 1em;
                    top: 0;
                }

                li input + ol {
                    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAURJREFUeNpi/P//PwMlgImBQkCxASwwRlLLKwYmJqZgRkbGbiBXEYva+0Dvlv7792/tvBoxTAO+fv0MororE6UU9VU5MHRfvP1DsX3+M5DhaxkYxDC98ObNGxBW1FVmY/j16xcYu6SdYvjw4QPDixcvGGSEvoLlQeqweuHdu7dg+vfv32D85ctXsNijR4/B4hwcnHA1WA348uUbmP779y+DUchOuIKQsltgetsUE7garAb8/w9h/vz5h+H0Sk8w2yRsN8OZVa5g9ocPn+BqsBrAzs4PdQEzw48ff+Fi375B2Gxs3HA1WNPB45NlDNzcIvfPXv8LVMwJxmdWOcDZF2//A8uD1GF1wefXZ8Q+Pt42oWN+VBED41d5DKv+/30IlJ8IVCcF5D2DCTPC8gIwAXEDKT4Qk0Di+wzU8xnDgKGbmQACDAAtTZadqmiADQAAAABJRU5ErkJggg==) 40px 0 no-repeat;
                    margin: -0.938em 0 0 -44px;
                    /* 15px */
                    height: 1em;
                }

                li input + ol > li {
                    display: none;
                    margin-left: -14px !important;
                    padding-left: 1px;
                }

                li label {
                    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAYJJREFUOBFjYBjygJGQD1SmfNb+w8Sw8g8js/uTTK6n6OqZ0AXs/HfKIov9ZWKIANoi+OQl53Mb7y2CDqH7eZDlUQywD9qSxcj056ZT6GZpJEXhQANWMTQw/mNiY1j9/8+3dcZpZ1hh8nADHAO2BjP8Z5zMwPi/ZN9qX7BT5ad/NQQqVP3H8G8lSMP/f0x5QMqY9/WL+UAe2PtgAxwDt9n/Y2RYChRsPLjOZxpIMQgwM/yPYGBgfPAgi/8EiH94o9c1BoZ/Pv8ZGAMdArZ2g8TgLgBx0MH//wxhjIxA5+MBYAP2r/c6yPSfIRpoWz0oHEDqFaZ9tAC6SOEvA+MKmH5b/21aQDu3MDL8X39gg3cpSBzugv0bvNcC/Z8L9FoPKBCZGJjCgfK3H2Zyn4cZwMj0bxKQffazqEQi0LL/IHG4ASAOyP///7Go79P2eQ6UDQMKgQMPJAcC/34xhDKycAWdnWXyGyICNAbGQKZlpn+TZvn/dyfLP4bwOzm8V5HlhiEbAAAVeUhVveSUAAAAAElFTkSuQmCC) 15px 1px no-repeat;
                    cursor: pointer;
                    display: block;
                    padding-left: 37px;
                }

                li input:checked + ol {
                    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAASxJREFUeNpi/P//PwMlgImBQkCxASwwRlLLKwYmJqZgRkbGbiBXEYva+0Dvlv7792/tvBoxTAO+fv0MororE6UU9VU5MHRfvP1DsX3+M5DhaxkYsBjw5s0bEKWoq6zA8OvXL7AYKIC/f//O8OPHDwYZIVaQGqjLlDENePfuLZj+/fs3GH/58pXh/fv3YDYIcHBwwtVgDYMvX76B6b9//zIYhezEULhtiglcDVYD/v+HMH/+/MNweqUnhsIPHz7B1WA1gJ2dH+oCZqCf/2IoZGPjhqvBmg4enyxj4OYWuX/2+l+gYk4MfPH2P7A8SB1WF3x+fUbs4+NtEzrmRxUxMH6Vx7Dq/9+HQPmJQHVSQN4zmDAjLC8AExA3kOIDMQkkvs9APZ8xDBi6mQkgwADDMYZH9Ls66AAAAABJRU5ErkJggg==) 40px 5px no-repeat;
                    margin: -1.25em 0 0 -44px;
                    /* 20px */
                    padding: 1.563em 0 0 80px;
                    height: auto;
                }

                li input:checked + ol > li {
                    display: block;
                    margin: 0 0 0.125em;
                    /* 2px */
                }

                li input:checked + ol > li:last-child {
                    margin: 0 0 0.063em;
                    /* 1px */
                }
            </style>
            <script>function noop(){};</script>
        </head>
        <body>
        `;
        
        html += `<ol class="tree">`;
        html += XmlTreeService._processXmlNode(xdoc.lastChild);
        html += `</ol>`;
        
        html +=
        `
        </body>
        </html>
        `;
        
        return html;
    }
    
    private static _processXmlNode(node: Node): string {
        let html: string = '';
        
        if (node.childNodes) {
            html += `<li><label for="ID">${node.localName}</label><input type="checkbox" id="ID" /><ol>`;
        }

        if (node.attributes) {
            for (let i = 0; i < node.attributes.length; i++) {
                html += `<li class="xml xml-attribute"><a href="javascript:noop()">${node.attributes.item(i).localName} = '${node.attributes.item(i).value}'</a></li>`;
            }
        }
        
        if (!node.childNodes && node.textContent) {
            html += `<li class="xml xml-text"><a href="javascript:noop()">${node.textContent}</a></li>`;
        }
        
        if (node.childNodes) {
            for (let i = 0; i < node.childNodes.length; i++) {
                html += XmlTreeService._processXmlNode(node.childNodes.item(i));
            }
            
            html += `</ol></li>`;
        }
        
        return html;
    }
}