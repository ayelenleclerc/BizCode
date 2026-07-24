# Untitled number in ArticuloInput Schema

```txt
undefined#/properties/precioEnMonedaOrigen
```

Required when monedaPrecio is USD or EUR; drives ARS precioLista1 via current TC (#243).

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                     |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [ArticuloInput.schema.json\*](../schema-json/ArticuloInput.schema.json "open original schema") |

## precioEnMonedaOrigen Type

`number`

## precioEnMonedaOrigen Constraints

**minimum**: the value of this number must greater than or equal to: `0.0001`
