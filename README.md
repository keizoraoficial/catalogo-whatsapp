# Catálogo WhatsApp

Plantilla gratuita de Keizora para mostrar tus productos y preparar pedidos por WhatsApp. Keizora usa GitHub Pages solo para la demo de Dulce María. [Ver la demo](https://keizoraoficial.github.io/catalogo-whatsapp/)

## 1. Crea tu copia

1. Crea una cuenta en [GitHub](https://github.com/signup) e inicia sesión.
2. Abre el [repositorio de la plantilla](https://github.com/keizoraoficial/catalogo-whatsapp). Un repositorio es la carpeta de tu proyecto en GitHub.
3. Sobre la lista de archivos, pulsa **Use this template** y luego **Create a new repository**.
4. En **Owner**, elige tu cuenta. En **Repository name**, escribe `catalogo`. Tu copia puede ser pública (**Public**) o privada (**Private**). Pulsa **Create repository from template**.

[Guía de GitHub para crear una copia](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)

## 2. Pon los datos de tu negocio desde el celular

1. Abre [Pages CMS](https://app.pagescms.org) e inicia sesión con GitHub.
2. Si te pide instalar la aplicación de GitHub, elige tu cuenta y dale acceso al repositorio que creaste. Vuelve a Pages CMS, abre tu repositorio y elige la rama `main` si aparece un selector.
3. Abre **Mi negocio**. Cambia el nombre, el título y el eslogan, sube tu logo y portada, y completa el horario, la dirección, el delivery y los métodos de pago.
4. **Cambia el número ficticio `51999999999` por tu WhatsApp antes de publicar.** Escribe `51` seguido de tus nueve dígitos, sin `+` ni espacios.
5. Si quieres cambiar los colores, usa códigos como `#4a2418`. Si dejas los colores vacíos, se usan los de la plantilla. Si dejas el logo vacío, se muestran las iniciales.
6. Pulsa **Save**. Abre **Productos** para editar, agregar o borrar productos. Escribe los precios en soles, sin el símbolo `S/`. Para un producto sin tamaños, completa **Precio desde**. Si agregas tamaños, escribe el precio de cada uno y usa el menor en **Precio desde**. Marca **Agotado** cuando el producto esté temporalmente fuera de stock. Pulsa **Save** de nuevo.
7. **Las fotos incluidas son de muestra. Reemplaza la portada y las fotos de productos por tus propias fotos.** Puedes subirlas al seleccionar una imagen en Pages CMS.

[Guía rápida de Pages CMS](https://pagescms.org/docs/quick-start/)

## 3. Publica tu catálogo con Cloudflare Pages

El plan gratuito de Cloudflare Pages permite el uso comercial.

1. Crea una cuenta gratuita en [Cloudflare](https://dash.cloudflare.com/) y verifica tu correo.
2. Ve a **Workers & Pages → Create application** y abre la pestaña **Pages** o el enlace **Get started** de Pages. Asegúrate de crear un proyecto **Pages**. Si la pantalla dice que estás creando un **Worker**, vuelve y elige **Pages**. Los nombres de los botones pueden variar.
3. Elige **Connect to Git** o **Import an existing Git repository**. Autoriza a Cloudflare en GitHub solo para tu repositorio `catalogo` y selecciona esa copia.
4. En **Production branch**, elige `main`. En **Framework preset**, elige **None**. Deja **Build command** vacío y escribe `/` en **Build output directory**. Pulsa **Save and Deploy**.
5. Cuando termine la publicación, abre la dirección que muestra Cloudflare. Será del tipo `nombre-del-proyecto.pages.dev`. Puede tener un nombre distinto al que elegiste. Usa esa dirección para compartir el enlace y crear el código QR.
6. Abre tu web desde el celular. Agrega un producto disponible y revisa que WhatsApp abra el borrador del pedido con tu número y el total correctos.

Cloudflare Pages publica automáticamente cada cambio que guardas en Pages CMS. Cuando termine la actualización, recarga tu web. El enlace **Editar mi web** del pie abre Pages CMS.

[Guía de Cloudflare Pages para conectar tu repositorio](https://developers.cloudflare.com/pages/get-started/git-integration/)

## Créditos de las fotos

Las fotos de muestra de la portada y los productos son de Unsplash y se usan bajo la [licencia gratuita de Unsplash](https://unsplash.com/license).

## Licencia

La licencia [MIT](LICENSE) cubre solo el código de la plantilla. Las fotos se rigen por la licencia de Unsplash.
