<img src="Img/logo.png">
<h1>Pizzeria Argenta SRL</h1>

<img src="Img/home.png">

<h1>www.romero.federico.hol.es/argenta</h1>
<h2>Ingreso sin Loguearse</h2>
<p>Una vez ingresada a la pagina, se muestra la pagina principal, conteniendo tres accesos directos a las principales funciones 
del sistema: El listado de productos, la visualizacion de los locales y el estado de los pedidos. Como no se encuentra registrado, 
solo podra ver los productos y los locales, el acceso a los pedidos emitira un alerta de que no se encuetra logueado. Tambien se muestra un menu con las opciones listadas, mas la opcion de poder registrarse o loguearse.</p>
<h2>Registro de nuevo cliente</h2>
Al ingresar a la pagina de login, si no tiene cuenta, el usuario invitado puede registrarse. Se ingresan todos los datos pertenecientes 
al usuario con excepcion de la imagen, ya que esto se realiza luego en el panel de control del usuario. Para finalizar el registro debe 
ingresar el captcha de Google. Si los datos son correctos y no coinciden datos esenciales con otros usuarios del sistema, se registrara 
exitosamente en la pagina.
<h2>Login </h2>
Si ya se encuentra registrado en el sistema, puede loguearse con el email y el password. Si no son correctos se emitira un mensaje de error. En caso de que el usuario no sea valido en el sistema, no podra loguearse. Para la prueba de testing, se incluyen cuatro botones de 
prueba con los tipos de usuarios del sistema: <strong>Cliente, Empleado, Encargado y Administrador</strong>
<h2>Operatoria comun de los usuarios:</h2>
<p>Al ingresar al sistema ya logueado, gracias al token almacenado del lado del cliente, se verifica desde el servidor si el usuario 
es valido, si el token no expiro o si se nego el acceso al mismo. En cualquier caso, se cerrara la sesion del individuo.
Cualquier usuario podra modificar sus datos en el panel de control, con excepcion del email por razones de seguridad.</p> 
<h2>Operatoria del Cliente:</h2>
<p>El cliente tiene la particularidad de poder realizar pedidos a traves de un carrito virtual. Puede mostrar el mismo y ocultarlo 
en cualquier momento mientras permanezca en una pagina sin recargarla. Puede agregar productos desde la pagina productos o la de locales. Al pasar estos al carrito, se mostraran los del ultimo local asignado, por ejemplo, en la pagina productos selecciona el local de avellaneda y pide alli una pizza, el carrito mostrara esta junto con cualquier producto de esta pizzeria. En el carrito se puede modificar la cantidad de cada producto, como asi tambien quitarlo del pedido. Por ultimo, puede seleccionar a que direccion se va a enviar: la registrada o la actual, a traves de geolocacion. Antes de pedir, se muestra la distancia y tiempo con respecto del local, junto con el monto total y la cantidad total de productos. Al aceptar la confirmacion que se pide al generar el pedido, se guardan los datos y si es correcto, se muestra un mensaje de exito, mientras que el carrito es limpiado.
La pagina pedidos muestra los que tiene en proceso y los recibidos. En la primer parte puede marcar como recibido el mismo. Al hacer esto se preguntara si desea completar la encuesta de satisfaccion. En cualquier caso, finaliza el pedido en cuestion.</p> 
<h2>Operatoria Empleado:</h2>
<p>A diferencia del cliente, solamente puede ver los productos de su local asignado. Al seleccionar un producto en la pagina del mismo nombre, pasara a la pagina locales con el mismo ya seleccionado. En esta puede seleccionar mas productos del local. Si confirma la realizacion del pedido, pasara a la pagina pedidos. En esta, se muestra los datos en cuestion, y se pide que se ingrese el email del usuario. Si es valido, se muestra su direccion y los datos del viaje. Si acepta el pedido, se guardara el mismo. La finalizacion del pedido solamente la puede realizar el cliente. En la misma pagina puede ver los pedidos en proceso y terminados del local. 
Ademas, puede ver los clientes del sistema y puede agregar uno nuevo. Por ultimo puede agregar nuevos productos al local. </p>
<h2>Operatoria Encargado:</h2>
<p>Ademas de lo que puede hacer el empleado, puede modificar los productos del local, el mismisimo local y el estado de los usuarios del sistama que puede manejar, siendo los empleados del local y los clientes. Este estado maneja si esta habilitado o no en ingresar al sistema. Por ultimo, puede agregar nuevos empleados al local. </p>
<h2>Operatoria Administrador:</h2>
<p>El administrador no puede ver los productos del sistema ni puede ver sus pedidos, ya que no puede realizarlos. Puede ver todos los usuarios del sistema y modificar su estado, con excepcion de otros adminsitradores, y puede agregar cualquier tipo de usuario, menos de su mismo tipo. Puede ver el listado de los locales, editarlos y agregar nuevos. Por ultimo puede ver los datos estadisticos del sistema, siendo las ventas por local, por productos, por dia, por clientes, ingresos al sistema, y resultados de encuestas. Estos datos pueden guardarse en un archivo pdf y/o csv. </p>
