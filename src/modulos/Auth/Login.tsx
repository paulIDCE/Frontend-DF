import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button, Form, Input, Modal } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { swalError, swalSuccess } from "@idce/kit";
import { useAuth } from "@/auth/AuthContext";
import "./login.css";

/**
 * Login / registro / recuperar password — porte de prueba-data
 * (`index.html` + `script.js`) sobre Supabase.
 *
 * ⚠️ Pantalla propia: los satelites del kit no tienen login (lo hace el SSO
 * host). Ver docs/ARQUITECTURA_APP.md.
 */

type Fuerza = "" | "debil" | "media" | "fuerte";

const fuerzaDe = (valor: string): Fuerza => {
  if (!valor) return "";
  if (valor.length < 6) return "debil";
  if (valor.length < 10 || !/[A-Z]/.test(valor) || !/[0-9]/.test(valor)) return "media";
  return "fuerte";
};

interface IngresoForm {
  email: string;
  password: string;
}

interface RegistroForm {
  username: string;
  email: string;
  passwordProvisional: string;
  password: string;
}

const Login = () => {
  const { session, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { desde?: string } | null)?.desde ?? "/dashboard";

  const [registroActivo, setRegistroActivo] = useState(false);
  const [fuerza, setFuerza] = useState<Fuerza>("");
  const [enviando, setEnviando] = useState(false);
  const [recuperarAbierto, setRecuperarAbierto] = useState(false);

  const [formRegistro] = Form.useForm<RegistroForm>();
  const [formRecuperar] = Form.useForm<{ email: string }>();

  if (session) return <Navigate to={destino} replace />;

  const ingresar = async ({ email, password }: IngresoForm) => {
    setEnviando(true);
    try {
      const user = await signIn(email.trim(), password);
      await swalSuccess(
        "¡Bienvenido!",
        `Hola ${user.user_metadata?.username || user.email}, has iniciado sesión correctamente.`
      );
      navigate(destino, { replace: true });
    } catch {
      swalError("Error", "Credenciales incorrectas. Verifica tu correo y password.");
    } finally {
      setEnviando(false);
    }
  };

  const registrar = async ({ username, email, password }: RegistroForm) => {
    setEnviando(true);
    try {
      await signUp(username.trim(), email.trim(), password);
      await swalSuccess(
        "¡Registro Exitoso!",
        `La cuenta para ${email} ha sido creada. Ahora puedes iniciar sesión.`
      );
      formRegistro.resetFields();
      setFuerza("");
      setRegistroActivo(false);
    } catch (e) {
      swalError("Error", e instanceof Error ? e.message : "No se pudo registrar.");
    } finally {
      setEnviando(false);
    }
  };

  const recuperar = async ({ email }: { email: string }) => {
    const correo = email.trim().toLowerCase();
    setEnviando(true);
    try {
      await resetPassword(correo);
      setRecuperarAbierto(false);
      formRecuperar.resetFields();
      swalSuccess(
        "Correo Enviado",
        `Se ha enviado un enlace seguro a ${correo} para restablecer tu contraseña.`
      );
    } catch {
      swalError("Error", "No se pudo procesar la solicitud. Verifica el correo.");
    } finally {
      setEnviando(false);
    }
  };

  const alternar = (
    <button
      type="button"
      className="md:hidden mt-3 bg-transparent border-0 text-accion cursor-pointer"
      onClick={() => setRegistroActivo((v) => !v)}
    >
      {registroActivo ? "¿Ya tiene cuenta? Iniciar sesión" : "¿No tiene cuenta? Registrarse"}
    </button>
  );

  return (
    <div className="login-pagina">
      <div className="login-fondo" aria-hidden>
        <div className="login-estrellas" />
        <div className="login-lago" />
        <div className="login-montanas" />
      </div>

      <div className={`login-caja ${registroActivo ? "registro-activo" : ""}`}>
        {/* Registro */}
        <div className="login-form login-form--registro">
          <h1>Crear Cuenta</h1>
          <span className="login-ayuda">Regístrese para acceder al sistema</span>
          <Form form={formRegistro} onFinish={registrar} className="w-full" size="large">
            <Form.Item name="username" rules={[{ required: true, message: "Ingrese un usuario" }]}>
              <Input prefix={<UserOutlined />} placeholder="Usuario" />
            </Form.Item>
            <Form.Item name="email" rules={[{ required: true, type: "email", message: "Correo inválido" }]}>
              <Input prefix={<MailOutlined />} placeholder="Correo electrónico" />
            </Form.Item>
            <Form.Item name="passwordProvisional" rules={[{ required: true, message: "Requerido" }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Password provisional" />
            </Form.Item>
            <Form.Item
              name="password"
              className="mb-0"
              rules={[
                { required: true, message: "Requerido" },
                { min: 6, message: "El password debe tener al menos 6 caracteres." },
                {
                  validator: (_, v: string) =>
                    !v || (/[a-zA-Z]/.test(v) && /[0-9]/.test(v))
                      ? Promise.resolve()
                      : Promise.reject(new Error("El password debe ser alfanumérico (letras y números).")),
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nuevo password (alfanumérico)"
                onChange={(e) => setFuerza(fuerzaDe(e.target.value))}
              />
            </Form.Item>
            <div className="login-fuerza">
              <div className={fuerza} />
            </div>
            <Button type="primary" htmlType="submit" shape="round" block loading={enviando}>
              REGISTRARSE
            </Button>
          </Form>
          {alternar}
        </div>

        {/* Ingreso */}
        <div className="login-form login-form--ingreso">
          <img src="/images/imgdatalux2.png" alt="Data Financiero" className="w-28 h-auto mb-3" />
          <h1>Iniciar Sesión</h1>
          <span className="login-ayuda">Ingrese sus credenciales</span>
          <Form<IngresoForm> onFinish={ingresar} className="w-full" size="large">
            <Form.Item name="email" rules={[{ required: true, type: "email", message: "Ingrese su correo" }]}>
              <Input prefix={<MailOutlined />} placeholder="Correo electrónico" autoComplete="email" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: "Ingrese su password" }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Password" autoComplete="current-password" />
            </Form.Item>
            <Button type="link" onClick={() => setRecuperarAbierto(true)}>
              ¿Olvidó su password?
            </Button>
            <Button type="primary" htmlType="submit" shape="round" block loading={enviando}>
              INGRESAR
            </Button>
          </Form>
          {alternar}
        </div>

        {/* Panel deslizante */}
        <div className="login-overlay-contenedor">
          <div className="login-overlay">
            <div className="login-panel login-panel--izq">
              <img src="/images/imgdatalux2.png" alt="" />
              <h1>¡Bienvenido de vuelta!</h1>
              <p>Para mantenerse conectado con nosotros, por favor inicie sesión con sus credenciales</p>
              <Button ghost shape="round" size="large" onClick={() => setRegistroActivo(false)}>
                INICIAR SESIÓN
              </Button>
            </div>
            <div className="login-panel login-panel--der">
              <img src="/images/imgdatalux2.png" alt="" />
              <h1>¡Hola, Usuario!</h1>
              <p>Ingrese sus datos personales y comience su viaje con Data Financiero</p>
              <Button ghost shape="round" size="large" onClick={() => setRegistroActivo(true)}>
                REGISTRARSE
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={recuperarAbierto}
        title="Recuperar Credenciales"
        onCancel={() => {
          setRecuperarAbierto(false);
          formRecuperar.resetFields();
        }}
        onOk={() => formRecuperar.submit()}
        okText="Enviar enlace"
        cancelText="Cancelar"
        confirmLoading={enviando}
        destroyOnHidden
      >
        <p className="text-tinta-secundaria">
          Ingresa tu correo electrónico registrado y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        <Form form={formRecuperar} onFinish={recuperar}>
          <Form.Item name="email" rules={[{ required: true, type: "email", message: "Por favor ingresa tu correo electrónico." }]}>
            <Input prefix={<MailOutlined />} placeholder="Correo electrónico" autoComplete="email" autoFocus />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Login;
