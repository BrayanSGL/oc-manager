Sub CrearNuevaOrden()
    Dim ws As Worksheet
    Dim nuevaHoja As Worksheet
    Dim ultimoConsecutivo As Integer
    Dim nuevoNombre As String

    ' Seleccionar la última hoja como base (última hoja existente)
    Set ws = ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count)

    ' Verificar si el nombre de la última hoja sigue el formato esperado
    If Left(ws.Name, 2) = "ST" And InStr(ws.Name, "-2025") > 0 Then
        ' Extraer el número del consecutivo actual
        ultimoConsecutivo = Val(Mid(ws.Name, 3, InStr(ws.Name, "-2025") - 3))
    Else
        MsgBox "La última hoja no tiene un nombre válido para generar un consecutivo.", vbExclamation
        Exit Sub
    End If

    ' Crear una copia de la última hoja (incluyendo texto, imágenes y formato)
    ws.Copy After:=ws
    Set nuevaHoja = ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count)

    ' Generar un nuevo nombre basado en el consecutivo
    nuevoNombre = "ST" & Format(ultimoConsecutivo + 1, "000") & "-2025"
    nuevaHoja.Name = nuevoNombre

    ' Escribir el nombre de la OC (nombre de la hoja) en la celda P6
    nuevaHoja.Range("P6").Value = nuevoNombre

    ' Confirmación
    MsgBox "Se ha creado la nueva hoja con el nombre: " & nuevoNombre, vbInformation
End Sub

Sub DebugOrdenDeCompra()
    Dim celdaSubtotal As Range
    Dim valorNeto As Variant
    
    Debug.Print "========== Depuración de la Orden de Compra =========="
    
    ' Depurar P6 (Orden de Compra)
    On Error Resume Next
    Debug.Print "Nombre de la hoja activa: " & ActiveSheet.Name
    Debug.Print "P6 (Orden de Compra): " & ActiveSheet.Range("P6").Value
    On Error GoTo 0

    ' Depurar F9 (Proveedor)
    On Error Resume Next
    Debug.Print "F9 (Proveedor): " & ActiveSheet.Range("F9").Value
    On Error GoTo 0

    ' Depurar Sub-Total y Valor Neto
    On Error Resume Next
    Set celdaSubtotal = ActiveSheet.Cells.Find(What:="Sub-Total", LookIn:=xlValues, LookAt:=xlWhole)
    If celdaSubtotal Is Nothing Then
        Debug.Print "Sub-Total: No encontrado."
    Else
        Debug.Print "Sub-Total encontrado en: " & celdaSubtotal.Address
        valorNeto = celdaSubtotal.Offset(0, 1).Value
        Debug.Print "Valor Neto (a la derecha de Sub-Total): " & valorNeto
    End If
    On Error GoTo 0
    
    Debug.Print "========== Fin de la Depuración =========="
    MsgBox "Depuración completada. Revisa la ventana de inmediato (Ctrl+G).", vbInformation
End Sub

Sub RegistrarOrdenEnCSV()
    Dim rutaCSV As String
    Dim archivoCSV As Object
    Dim fso As Object
    Dim datosRegistro As String
    Dim valorNeto As Variant
    Dim celdaSubtotal As Range
    
    ' Ruta del archivo CSV
    rutaCSV = "C:\Users\bgale\Downloads\Test\y. Registro de facturación 2025.csv"
    
    ' Buscar el valor Neto (justo a la derecha de 'Sub-Total')
    Set celdaSubtotal = ActiveSheet.Cells.Find(What:="Sub-Total", LookIn:=xlValues, LookAt:=xlWhole)
    If Not celdaSubtotal Is Nothing Then
        valorNeto = celdaSubtotal.Offset(0, 1).Value
    Else
        valorNeto = "No encontrado"
    End If

    ' Generar la línea de datos para el CSV en el orden adecuado
    datosRegistro = _
        Date & "," & _
        ActiveSheet.Range("P6").Value & "," & _
        ActiveSheet.Range("F9").Value & "," & _
        valorNeto

    ' Crear el archivo CSV si no existe, o agregar datos si ya existe
    Set fso = CreateObject("Scripting.FileSystemObject")
    If Not fso.FileExists(rutaCSV) Then
        ' Crear un nuevo archivo CSV con encabezados
        Set archivoCSV = fso.CreateTextFile(rutaCSV, True)
        archivoCSV.WriteLine "Fecha de creacion,Orden de compra,Proveedor,Valor neto"
    Else
        ' Abrir el archivo CSV existente
        Set archivoCSV = fso.OpenTextFile(rutaCSV, 8) ' Modo 8: Añadir texto
    End If

    ' Agregar los datos al archivo CSV con un salto de línea
    archivoCSV.WriteLine datosRegistro
    archivoCSV.Close

    ' Confirmación
    MsgBox "Registro guardado en el archivo CSV.", vbInformation
End Sub

Sub GuardarOrdenComoPDF()
    Dim rutaPDF As String
    Dim nombreArchivo As String
    Dim valorP6 As String
    
    ' Obtener el valor de la celda P6 (Orden de Compra)
    valorP6 = ActiveSheet.Range("P6").Value
    
    ' Si la celda P6 está vacía, usar el nombre de la hoja
    If valorP6 = "" Then
        nombreArchivo = ActiveSheet.Name
    Else
        nombreArchivo = valorP6
    End If

    ' Ruta donde se guardará el PDF
    rutaPDF = ThisWorkbook.Path & "\" & nombreArchivo & ".pdf"

    ' Guardar la hoja activa como PDF
    On Error Resume Next
    ActiveSheet.ExportAsFixedFormat Type:=xlTypePDF, Filename:=rutaPDF, Quality:=xlQualityStandard, IncludeDocProperties:=True, IgnorePrintAreas:=False, OpenAfterPublish:=False
    On Error GoTo 0

    ' Confirmación de guardado
    If Dir(rutaPDF) <> "" Then
        MsgBox "La Orden de Compra se ha guardado como PDF en: " & rutaPDF, vbInformation
    Else
        MsgBox "Hubo un problema al guardar el PDF. Verifica los permisos de la carpeta.", vbExclamation
    End If
End Sub

Sub RegistrarOrdenEnSQLite()
    Dim conexion As Object
    Dim comando As Object
    Dim cadenaConexion As String
    Dim sqlCrearTabla As String
    Dim sqlInsertarDatos As String
    Dim valorNeto As Variant
    Dim celdaSubtotal As Range

    ' Define la ruta de la base de datos SQLite
    Dim rutaDB As String
    rutaDB = ThisWorkbook.Path & "\ordenes.db"

    ' Configura la conexión ODBC
    cadenaConexion = "Driver={SQLite3 ODBC Driver};Database=" & rutaDB & ";"

    ' Conectar a la base de datos
    Set conexion = CreateObject("ADODB.Connection")
    conexion.Open cadenaConexion

    ' Crear tabla si no existe
    sqlCrearTabla = "CREATE TABLE IF NOT EXISTS Ordenes (" & _
                    "ID INTEGER PRIMARY KEY AUTOINCREMENT, " & _
                    "Fecha TEXT, " & _
                    "OrdenDeCompra TEXT, " & _
                    "Proveedor TEXT, " & _
                    "ValorNeto TEXT);"
    conexion.Execute sqlCrearTabla

    ' Recuperar datos de la hoja activa
    Set celdaSubtotal = ActiveSheet.Cells.Find(What:="Sub-Total", LookIn:=xlValues, LookAt:=xlWhole)
    If Not celdaSubtotal Is Nothing Then
        valorNeto = celdaSubtotal.Offset(0, 1).Value
    Else
        valorNeto = "No encontrado"
    End If

    ' Insertar datos
    sqlInsertarDatos = "INSERT INTO Ordenes (Fecha, OrdenDeCompra, Proveedor, ValorNeto) VALUES (" & _
                       "'" & Date & "', " & _
                       "'" & ActiveSheet.Range("P6").Value & "', " & _
                       "'" & ActiveSheet.Range("F9").Value & "', " & _
                       "'" & valorNeto & "');"
    conexion.Execute sqlInsertarDatos

    MsgBox "Orden registrada en la base de datos SQLite.", vbInformation

    ' Cerrar conexión
    conexion.Close
    Set conexion = Nothing
End Sub


