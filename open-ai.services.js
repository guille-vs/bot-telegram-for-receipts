const OpenAIApi = require("openai");
const { envirionments } = require("./environments");

const openai = new OpenAIApi({
  apiKey: envirionments.openAiSecret,
});

async function generateJSONFromReceipt(textInPhoto, caption) {
  try {
    const prompt =
      `Texto procesado por el servicio de aws rekognition al cual se le envió la imagen de un recibo, voucher, boleta, factura o cualquier otro tipo de comprobante de pago:
      ${textInPhoto}
      Texto obtenido de una descripción personalizada de la imagen introducida por el usuario:
      ${caption}
      Instrucciones:
      debo extraer los detalles de la compra, la tienda, el método de pago, categoría, subcategoría y demás datos, y los presentaré en un formato JSON siguiendo este esquema:
        {
          "success: true,
          "store": {
            "name": "[Nombre de la tienda]",
            "address": "[Dirección de la tienda]",
            "city": "[Ciudad]",
            "country": "[País]",
            "telephone": "[Número de teléfono de la tienda]"
          },
          "invoice": {
            "invoice_type": "[Boleta o Factura]",
            "number": "[Número de factura]",
            "issue_date": "[Fecha de emisión]",
            "issue_time": "[Hora de emisión]"
          },
          "items": [
            {
              "code": "[Código del artículo]",
              "description": "[Descripción del artículo]",
              "quantity": [Cantidad],
              "unit_price": [Precio unitario],
              "discount": [Descuento],
              "total": [Total por artículo]
            },
            // ... otros artículos si los hay
          ],
          "totals": {
            "total_discount": [Descuento total],
            "subtotal": [Subtotal],
            "taxable_operations": [Operaciones gravadas],
            "igv": [IGV],
            "total_sale": [Venta total]
          },
          "payment": {
            "method": "[Método de pago]",
            "card": "[Números finales]"
            "amount": [Monto pagado],
            "currency": "[Soles (PEN) o Dólares (USD)]",
            "amount_in_words": "[Monto en palabras]"
          },
          "cashier": {
            "register_number": "[Número de caja]",
            "attendant": "[Nombre del cajero]"
          },
          "client": {
            "ruc": "[RUC del cliente]",
            "name": "[Nombre del cliente]",
            "address": "[Dirección del cliente]",
            "email": "[Correo electrónico del cliente]"
          },
          "return_policy": {
            "timeframe": "[Plazo para devoluciones]",
            "condition": "[Condición de los productos para la devolución]",
            "restrictions": "[Restricciones y condiciones]"
          },
          "website": "[Sitio web de la tienda]",
          "category": "[Categoría de gastos]",
          "subcategory": "[Categoría de gastos]",
          "data_in_text": "[Texto completo de la factura en clave:valor separado por saltos de línea]"
        }
        
        Proporcionaré esta información en inglés y con las propiedades en minúsculas, adecuado para la integración en sistemas que utilizan JSON. Devolveré solamente el json sin agrega texto descriptivo adicional.
        De no hallar la respuesta, deberás devolver un mensaje pidiendo la información que te esté faltando para completar el esquema de la siguiente forma: 
        {
          success: faslse,
          message: "Por favor, indícame el/la ..."
        }
        Información adicional:
        - El formato de fecha debe ser YYYY-MM-DD.
        - El formato de hora debe ser HH:MM:SS.
        - El formato de moneda debe ser PEN o USD.
        - Siempre que los pagos sean de yape, plim o transferencia, el nombre de la persona que aparece, es el dueño del store.
        - No completes el nombre del cliente con el nombre del store o cajero.
        - Si es una imagen de transferencia en la parte de descripción o notas siempre encontrarás detalles de los productos (items) o del cliente.
        `;
    const response = await openai.chat.completions.create({
      model: envirionments.openAiModel, // o el identificador del modelo más reciente que desees usar
      messages: [{ role: "user", content: prompt }],
      max_tokens: envirionments.openAiMaxTokens,
      temperature: envirionments.openAiTemperature,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return receiptDTO(response.choices[0].message.content);
  } catch (error) {
    console.error(error);
  }
}

const receiptDTO = (text) => {
  return JSON.parse(text)
};

module.exports = { generateJSONFromReceipt };
