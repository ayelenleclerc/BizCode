# LoteSerialUpdateInput Schema

```txt
undefined
```

Operator-entered unit serial / DataMatrix payload; stored verbatim (#204).

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LoteSerialUpdateInput.schema.json](../schema-json/LoteSerialUpdateInput.schema.json "open original schema") |

## LoteSerialUpdateInput Type

`object` ([LoteSerialUpdateInput](loteserialupdateinput.md))

# LoteSerialUpdateInput Properties

| Property                              | Type     | Required | Nullable       | Defined by                                                                                                             |
| :------------------------------------ | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [codigoDatamatrix](#codigodatamatrix) | `string` | Optional | cannot be null | [LoteSerialUpdateInput](loteserialupdateinput-properties-codigodatamatrix.md "undefined#/properties/codigoDatamatrix") |
| [serialUnidad](#serialunidad)         | `string` | Optional | cannot be null | [LoteSerialUpdateInput](loteserialupdateinput-properties-serialunidad.md "undefined#/properties/serialUnidad")         |

## codigoDatamatrix



`codigoDatamatrix`

* is optional

* Type: `string`

* cannot be null

* defined in: [LoteSerialUpdateInput](loteserialupdateinput-properties-codigodatamatrix.md "undefined#/properties/codigoDatamatrix")

### codigoDatamatrix Type

`string`

### codigoDatamatrix Constraints

**maximum length**: the maximum number of characters for this string is: `200`

## serialUnidad



`serialUnidad`

* is optional

* Type: `string`

* cannot be null

* defined in: [LoteSerialUpdateInput](loteserialupdateinput-properties-serialunidad.md "undefined#/properties/serialUnidad")

### serialUnidad Type

`string`

### serialUnidad Constraints

**maximum length**: the maximum number of characters for this string is: `60`
