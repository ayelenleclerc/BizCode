# SugerenciasPedido Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SugerenciasPedidoEnvelope.schema.json\*](../schema-json/SugerenciasPedidoEnvelope.schema.json "open original schema") |

## data Type

`object` ([SugerenciasPedido](sugerenciaspedido.md))

# data Properties

| Property                  | Type     | Required | Nullable       | Defined by                                                                                         |
| :------------------------ | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [habituales](#habituales) | `array`  | Required | cannot be null | [SugerenciasPedido](sugerenciaspedido-properties-habituales.md "undefined#/properties/habituales") |
| [ofertas](#ofertas)       | `array`  | Required | cannot be null | [SugerenciasPedido](sugerenciaspedido-properties-ofertas.md "undefined#/properties/ofertas")       |
| [source](#source)         | `string` | Required | cannot be null | [SugerenciasPedido](sugerenciaspedidosource.md "undefined#/properties/source")                     |

## habituales



`habituales`

* is required

* Type: `object[]` ([SugerenciaHabitual](sugerenciahabitual.md))

* cannot be null

* defined in: [SugerenciasPedido](sugerenciaspedido-properties-habituales.md "undefined#/properties/habituales")

### habituales Type

`object[]` ([SugerenciaHabitual](sugerenciahabitual.md))

## ofertas



`ofertas`

* is required

* Type: `object[]` ([SugerenciaOferta](sugerenciaoferta.md))

* cannot be null

* defined in: [SugerenciasPedido](sugerenciaspedido-properties-ofertas.md "undefined#/properties/ofertas")

### ofertas Type

`object[]` ([SugerenciaOferta](sugerenciaoferta.md))

## source



`source`

* is required

* Type: `string` ([SugerenciasPedidoSource](sugerenciaspedidosource.md))

* cannot be null

* defined in: [SugerenciasPedido](sugerenciaspedidosource.md "undefined#/properties/source")

### source Type

`string` ([SugerenciasPedidoSource](sugerenciaspedidosource.md))

### source Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value             | Explanation |
| :---------------- | :---------- |
| `"historial"`     |             |
| `"ultimo_pedido"` |             |
| `"vacio"`         |             |
